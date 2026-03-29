import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateDecisionDto } from './dto/update-decision.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { ApplicationStatus, UserRole, Decision, Prisma } from '@prisma/client';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApplicationDto, candidateId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const existingApplication = await this.prisma.application.findFirst({
      where: {
        candidateId,
        jobId: dto.jobId,
      },
    });

    if (existingApplication) {
      throw new ForbiddenException('You have already applied for this job');
    }

    const application = await this.prisma.application.create({
      data: {
        candidateId,
        jobId: dto.jobId,
        status: ApplicationStatus.PENDING,
      },
    });

    return application;
  }

  async findAll(query: QueryApplicationDto, user: CurrentUserData) {
    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (user.role === UserRole.CANDIDATE) {
      where.candidateId = user.userId;
    }

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          finalScore: {
            select: {
              id: true,
              finalScore: true,
              decision: true,
            },
          },
          _count: {
            select: {
              exams: true,
              interviews: true,
            },
          },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: CurrentUserData) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            requirements: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        exams: {
          include: {
            submissions: {
              include: {
                aiScore: true,
              },
            },
          },
        },
        interviews: {
          include: {
            scores: {
              include: {
                interviewer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        finalScore: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (
      user.role === UserRole.CANDIDATE &&
      application.candidateId !== user.userId
    ) {
      throw new ForbiddenException('You can only view your own applications');
    }

    return application;
  }

  async finalize(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        exams: {
          include: {
            submissions: {
              include: {
                aiScore: true,
              },
            },
          },
        },
        interviews: {
          include: {
            scores: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const aiScores: number[] = [];
    application.exams.forEach((exam) => {
      exam.submissions.forEach((submission) => {
        if (submission.aiScore) {
          aiScores.push(submission.aiScore.totalScore);
        }
      });
    });

    const aiScore =
      aiScores.length > 0
        ? aiScores.reduce((sum, score) => sum + score, 0) / aiScores.length
        : 0;

    const interviewerScores: number[] = [];
    application.interviews.forEach((interview) => {
      interview.scores.forEach((score) => {
        interviewerScores.push(score.totalScore);
      });
    });

    const interviewerScore =
      interviewerScores.length > 0
        ? interviewerScores.reduce((sum, score) => sum + score, 0) /
          interviewerScores.length
        : 0;

    const finalScoreValue = aiScore + interviewerScore;

    let decision: Decision;
    if (finalScoreValue >= 80) {
      decision = Decision.RECOMMEND;
    } else if (finalScoreValue >= 65) {
      decision = Decision.MAYBE;
    } else {
      decision = Decision.REJECT;
    }

    const finalScore = await this.prisma.finalScore.upsert({
      where: { applicationId: id },
      create: {
        applicationId: id,
        aiScore,
        interviewerScore,
        finalScore: finalScoreValue,
        decision,
      },
      update: {
        aiScore,
        interviewerScore,
        finalScore: finalScoreValue,
        decision,
      },
    });

    await this.prisma.application.update({
      where: { id },
      data: { status: ApplicationStatus.INTERVIEW_COMPLETED },
    });

    return finalScore;
  }

  async updateDecision(id: string, dto: UpdateDecisionDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const finalScore = await this.prisma.finalScore.upsert({
      where: { applicationId: id },
      create: {
        applicationId: id,
        aiScore: 0,
        interviewerScore: 0,
        finalScore: 0,
        decision: dto.decision,
      },
      update: {
        decision: dto.decision,
      },
    });

    return finalScore;
  }

  async getReport(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        exams: {
          include: {
            submissions: {
              include: {
                aiScore: true,
              },
            },
          },
        },
        interviews: {
          include: {
            scores: {
              include: {
                interviewer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
        finalScore: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const aiScores: Array<{
      questionId: string;
      totalScore: number;
      breakdown: Prisma.JsonValue;
      codeAnnotations: Prisma.JsonValue;
      suggestedQuestions: string[];
      behaviorSummary: Prisma.JsonValue;
    }> = [];
    application.exams.forEach((exam) => {
      exam.submissions.forEach((submission) => {
        if (submission.aiScore) {
          aiScores.push({
            questionId: submission.questionId,
            totalScore: submission.aiScore.totalScore,
            breakdown: submission.aiScore.breakdown,
            codeAnnotations: submission.aiScore.codeAnnotations,
            suggestedQuestions: submission.aiScore.suggestedQuestions,
            behaviorSummary: submission.aiScore.behaviorSummary,
          });
        }
      });
    });

    const aiScoreAvg =
      aiScores.length > 0
        ? aiScores.reduce((sum, s) => sum + s.totalScore, 0) / aiScores.length
        : 0;

    const interviewerScores = application.interviews.flatMap((i) => i.scores);
    const interviewerScoreAvg =
      interviewerScores.length > 0
        ? interviewerScores.reduce((sum: number, s) => sum + s.totalScore, 0) /
          interviewerScores.length
        : 0;

    const finalScoreValue = aiScoreAvg + interviewerScoreAvg;

    const deviation = Math.abs(aiScoreAvg - interviewerScoreAvg);
    const needsReview = deviation > 20;

    return {
      candidate: application.candidate,
      job: application.job,
      aiScores,
      interviewerScores: interviewerScores.map((s) => ({
        id: s.id,
        interviewer: s.interviewer,
        techDepth: s.techDepth,
        communication: s.communication,
        overallQuality: s.overallQuality,
        cultureFit: s.cultureFit,
        totalScore: s.totalScore,
        comments: s.comments,
        createdAt: s.createdAt,
      })),
      summary: {
        aiScore: aiScoreAvg,
        interviewerScore: interviewerScoreAvg,
        finalScore: finalScoreValue,
        decision: application.finalScore?.decision || null,
        deviation,
        needsReview,
      },
    };
  }
}
