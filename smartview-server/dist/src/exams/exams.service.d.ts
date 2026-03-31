import { PrismaService } from '../prisma/prisma.service';
import { SandboxService, RunCodeResult } from '../sandbox/sandbox.service';
import { ScoringService } from '../scoring/scoring.service';
import { QuestionGeneratorService, GeneratedQuestion } from './question-generator.service';
import { Exam, ExamStatus, Question, ExamSubmission } from '@prisma/client';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitCodeDto } from './dto/submit-code.dto';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
interface QuestionWithoutHidden extends Omit<Question, 'hiddenTestCases'> {
    hiddenTestCases?: never;
}
export declare class ExamsService {
    private readonly prisma;
    private readonly sandboxService;
    private readonly questionGeneratorService;
    private readonly scoringService;
    constructor(prisma: PrismaService, sandboxService: SandboxService, questionGeneratorService: QuestionGeneratorService, scoringService: ScoringService);
    create(createExamDto: CreateExamDto): Promise<Exam>;
    generateExam(applicationId: string): Promise<{
        exam: Exam;
        questions: Question[];
    }>;
    previewGeneratedQuestions(applicationId: string): Promise<GeneratedQuestion[]>;
    findOne(id: string, user: CurrentUserData): Promise<{
        exam: Exam;
        questions: QuestionWithoutHidden[];
        submissions: ExamSubmission[];
    }>;
    startExam(id: string, user: CurrentUserData): Promise<Exam>;
    saveSubmission(examId: string, questionId: string, user: CurrentUserData, submitCodeDto: SubmitCodeDto): Promise<ExamSubmission>;
    runCode(examId: string, questionId: string, user: CurrentUserData, submitCodeDto: SubmitCodeDto): Promise<RunCodeResult>;
    submitExam(id: string, user: CurrentUserData): Promise<{
        exam: Exam;
        message: string;
    }>;
    private triggerScoringAsync;
    getStatus(id: string, user: CurrentUserData): Promise<{
        status: ExamStatus;
        startedAt: Date | null;
        submittedAt: Date | null;
        timeRemaining: number | null;
    }>;
}
export {};
