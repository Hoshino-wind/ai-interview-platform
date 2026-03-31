import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SandboxService, RunCodeResult } from '../sandbox/sandbox.service';
import { ScoringService } from '../scoring/scoring.service';
import { QuestionGeneratorService, GeneratedQuestion } from './question-generator.service';
import {
  Exam,
  ExamStatus,
  ApplicationStatus,
  Question,
  ExamSubmission,
  Prisma,
} from '@prisma/client';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitCodeDto } from './dto/submit-code.dto';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ExamWithRelations extends Exam {
  application: {
    candidateId: string;
    status: ApplicationStatus;
  };
  submissions: ExamSubmission[];
}

interface QuestionWithoutHidden extends Omit<Question, 'hiddenTestCases'> {
  hiddenTestCases?: never;
}

@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sandboxService: SandboxService,
    private readonly questionGeneratorService: QuestionGeneratorService,
    @Inject(forwardRef(() => ScoringService))
    private readonly scoringService: ScoringService,
  ) {}

  async create(createExamDto: CreateExamDto): Promise<Exam> {
    const { applicationId, questionIds, timeLimit } = createExamDto;

    // Verify application exists
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID "${applicationId}" not found`,
      );
    }

    // Verify all questions exist
    const questions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    if (questions.length !== questionIds.length) {
      throw new BadRequestException('Some question IDs are invalid');
    }

    // Create exam and update application status in a transaction
    const [exam] = await this.prisma.$transaction([
      this.prisma.exam.create({
        data: {
          applicationId,
          questionIds,
          timeLimit: timeLimit ?? 7200, // Default 2 hours
          status: ExamStatus.NOT_STARTED,
        },
      }),
      this.prisma.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.EXAM_SENT },
      }),
    ]);

    return exam;
  }

  /**
   * Generate AI-personalized exam for an application
   */
  async generateExam(applicationId: string): Promise<{
    exam: Exam;
    questions: Question[];
  }> {
    // Verify application exists
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID "${applicationId}" not found`,
      );
    }

    // Generate questions using AI
    const generatedQuestions = await this.questionGeneratorService.generateQuestions(applicationId);

    // Create Question records and Exam in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create Question records for each generated question
      const createdQuestions: Question[] = [];
      
      for (const gq of generatedQuestions) {
        const question = await tx.question.create({
          data: {
            type: this.questionGeneratorService.determineQuestionType(gq.title, gq.description),
            difficulty: this.questionGeneratorService.mapDifficulty(gq.difficulty),
            title: gq.title,
            description: gq.description,
            starterCode: gq.starterCode ? { code: gq.starterCode } : Prisma.JsonNull,
            testCases: gq.testCases ? { cases: gq.testCases } : {},
            hiddenTestCases: Prisma.JsonNull,
            evaluationRubric: { criteria: gq.evaluationCriteria },
            timeLimit: gq.estimatedTime * 60, // Convert minutes to seconds
            tags: gq.relatedSkills,
            languageSupport: ['javascript', 'typescript', 'python'],
          },
        });
        createdQuestions.push(question);
      }

      // Calculate total time limit
      const totalTimeMinutes = generatedQuestions.reduce(
        (sum, q) => sum + q.estimatedTime,
        0,
      );

      // Create Exam
      const exam = await tx.exam.create({
        data: {
          applicationId,
          questionIds: createdQuestions.map((q) => q.id),
          timeLimit: totalTimeMinutes * 60, // Convert minutes to seconds
          status: ExamStatus.NOT_STARTED,
        },
      });

      // Update application status
      await tx.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.EXAM_SENT },
      });

      return { exam, questions: createdQuestions };
    });

    return result;
  }

  /**
   * Preview generated questions without creating an exam
   */
  async previewGeneratedQuestions(applicationId: string): Promise<GeneratedQuestion[]> {
    // Verify application exists
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID "${applicationId}" not found`,
      );
    }

    return this.questionGeneratorService.generateQuestions(applicationId);
  }

  async findOne(
    id: string,
    user: CurrentUserData,
  ): Promise<{
    exam: Exam;
    questions: QuestionWithoutHidden[];
    submissions: ExamSubmission[];
  }> {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        application: {
          select: {
            candidateId: true,
            status: true,
          },
        },
        submissions: true,
      },
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID "${id}" not found`);
    }

    // Check permissions
    if (
      user.role === 'CANDIDATE' &&
      exam.application.candidateId !== user.userId
    ) {
      throw new ForbiddenException('You do not have access to this exam');
    }

    // Get questions without hidden test cases for candidate view
    const questions = await this.prisma.question.findMany({
      where: { id: { in: exam.questionIds } },
      select: {
        id: true,
        type: true,
        difficulty: true,
        title: true,
        description: true,
        starterCode: true,
        testCases: true,
        hiddenTestCases: user.role === 'CANDIDATE' ? false : true,
        evaluationRubric: true,
        timeLimit: true,
        tags: true,
        languageSupport: true,
        aiScoringConfig: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Remove hiddenTestCases from response for candidates
    const sanitizedQuestions: QuestionWithoutHidden[] = questions.map((q) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hiddenTestCases, ...rest } = q as unknown as Question;
      return rest as QuestionWithoutHidden;
    });

    return {
      exam,
      questions: sanitizedQuestions,
      submissions: exam.submissions,
    };
  }

  async startExam(id: string, user: CurrentUserData): Promise<Exam> {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        application: {
          select: {
            candidateId: true,
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID "${id}" not found`);
    }

    // Only candidate can start their own exam
    if (
      user.role === 'CANDIDATE' &&
      exam.application.candidateId !== user.userId
    ) {
      throw new ForbiddenException('You do not have access to this exam');
    }

    if (exam.status !== ExamStatus.NOT_STARTED) {
      throw new BadRequestException(
        `Exam cannot be started. Current status: ${exam.status}`,
      );
    }

    return this.prisma.exam.update({
      where: { id },
      data: {
        status: ExamStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });
  }

  async saveSubmission(
    examId: string,
    questionId: string,
    user: CurrentUserData,
    submitCodeDto: SubmitCodeDto,
  ): Promise<ExamSubmission> {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        application: {
          select: {
            candidateId: true,
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID "${examId}" not found`);
    }

    // Only candidate can save submissions for their own exam
    if (
      user.role === 'CANDIDATE' &&
      exam.application.candidateId !== user.userId
    ) {
      throw new ForbiddenException('You do not have access to this exam');
    }

    if (exam.status !== ExamStatus.IN_PROGRESS) {
      throw new BadRequestException('Exam is not in progress');
    }

    // Verify question is part of the exam
    if (!exam.questionIds.includes(questionId)) {
      throw new BadRequestException('Question is not part of this exam');
    }

    // Upsert submission
    return this.prisma.examSubmission.upsert({
      where: {
        examId_questionId: {
          examId,
          questionId,
        },
      },
      create: {
        examId,
        questionId,
        code: submitCodeDto.code,
        language: submitCodeDto.language,
      },
      update: {
        code: submitCodeDto.code,
        language: submitCodeDto.language,
      },
    });
  }

  async runCode(
    examId: string,
    questionId: string,
    user: CurrentUserData,
    submitCodeDto: SubmitCodeDto,
  ): Promise<RunCodeResult> {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        application: {
          select: {
            candidateId: true,
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID "${examId}" not found`);
    }

    // Only candidate can run code for their own exam
    if (
      user.role === 'CANDIDATE' &&
      exam.application.candidateId !== user.userId
    ) {
      throw new ForbiddenException('You do not have access to this exam');
    }

    if (exam.status !== ExamStatus.IN_PROGRESS) {
      throw new BadRequestException('Exam is not in progress');
    }

    // Verify question is part of the exam
    if (!exam.questionIds.includes(questionId)) {
      throw new BadRequestException('Question is not part of this exam');
    }

    // Get question with public test cases
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID "${questionId}" not found`);
    }

    // Parse test cases
    const testCases =
      (question.testCases as Array<{
        input: string;
        expectedOutput: string;
      }>) || [];

    // Run code in sandbox
    const result = await this.sandboxService.runCode({
      code: submitCodeDto.code,
      language: submitCodeDto.language,
      testCases,
    });

    // Save the code submission
    await this.prisma.examSubmission.upsert({
      where: {
        examId_questionId: {
          examId,
          questionId,
        },
      },
      create: {
        examId,
        questionId,
        code: submitCodeDto.code,
        language: submitCodeDto.language,
        testResults: result.testResults as unknown as Prisma.InputJsonValue,
      },
      update: {
        code: submitCodeDto.code,
        language: submitCodeDto.language,
        testResults: result.testResults as unknown as Prisma.InputJsonValue,
      },
    });

    return result;
  }

  async submitExam(
    id: string,
    user: CurrentUserData,
  ): Promise<{
    exam: Exam;
    message: string;
  }> {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        application: {
          select: {
            candidateId: true,
            id: true,
          },
        },
        submissions: true,
      },
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID "${id}" not found`);
    }

    // Only candidate can submit their own exam
    if (
      user.role === 'CANDIDATE' &&
      exam.application.candidateId !== user.userId
    ) {
      throw new ForbiddenException('You do not have access to this exam');
    }

    if (exam.status !== ExamStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Exam cannot be submitted. Current status: ${exam.status}`,
      );
    }

    // Check if exam has timed out
    if (exam.startedAt) {
      const now = new Date();
      const elapsedSeconds = (now.getTime() - exam.startedAt.getTime()) / 1000;
      if (elapsedSeconds > exam.timeLimit) {
        throw new BadRequestException('Exam time limit has been exceeded');
      }
    }

    // Run hidden test cases for all submissions
    const questions = await this.prisma.question.findMany({
      where: { id: { in: exam.questionIds } },
    });

    for (const submission of exam.submissions) {
      const question = questions.find((q) => q.id === submission.questionId);
      if (question && question.hiddenTestCases) {
        const hiddenTestCases = question.hiddenTestCases as Array<{
          input: string;
          expectedOutput: string;
        }>;

        if (hiddenTestCases && hiddenTestCases.length > 0) {
          const result = await this.sandboxService.runCode({
            code: submission.code,
            language: submission.language,
            testCases: hiddenTestCases,
          });

          // Update submission with hidden test results
          await this.prisma.examSubmission.update({
            where: { id: submission.id },
            data: {
              testResults:
                result.testResults as unknown as Prisma.InputJsonValue,
            },
          });
        }
      }
    }

    // Update exam status and application status in a transaction
    const [updatedExam] = await this.prisma.$transaction([
      this.prisma.exam.update({
        where: { id },
        data: {
          status: ExamStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      }),
      this.prisma.application.update({
        where: { id: exam.application.id },
        data: { status: ApplicationStatus.EXAM_COMPLETED },
      }),
    ]);

    // Trigger scoring asynchronously (fire and forget)
    void this.triggerScoringAsync(id);

    return {
      exam: updatedExam,
      message: 'Exam submitted successfully',
    };
  }

  /**
   * Trigger scoring asynchronously after exam submission
   */
  private triggerScoringAsync(examId: string): void {
    // Use setTimeout to ensure this runs after the current request completes
    setTimeout(() => {
      this.scoringService.scoreExam(examId).catch((error: Error) => {
        console.error(`Failed to score exam ${examId}:`, error.message);
      });
    }, 100);
  }

  async getStatus(
    id: string,
    user: CurrentUserData,
  ): Promise<{
    status: ExamStatus;
    startedAt: Date | null;
    submittedAt: Date | null;
    timeRemaining: number | null;
  }> {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        application: {
          select: {
            candidateId: true,
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID "${id}" not found`);
    }

    // Only candidate can check their own exam status
    if (
      user.role === 'CANDIDATE' &&
      exam.application.candidateId !== user.userId
    ) {
      throw new ForbiddenException('You do not have access to this exam');
    }

    let timeRemaining: number | null = null;

    if (exam.status === ExamStatus.IN_PROGRESS && exam.startedAt) {
      const now = new Date();
      const elapsedSeconds = (now.getTime() - exam.startedAt.getTime()) / 1000;
      timeRemaining = Math.max(0, exam.timeLimit - elapsedSeconds);
    }

    return {
      status: exam.status,
      startedAt: exam.startedAt,
      submittedAt: exam.submittedAt,
      timeRemaining,
    };
  }
}
