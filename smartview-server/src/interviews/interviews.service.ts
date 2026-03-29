import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { SubmitScoreDto } from './dto/submit-score.dto';
import { QueryInterviewDto } from './dto/query-interview.dto';
import {
  InterviewStatus,
  ApplicationStatus,
  UserRole,
  Prisma,
} from '@prisma/client';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

@Injectable()
export class InterviewsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInterviewDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: dto.applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const interview = await this.prisma.interview.create({
      data: {
        applicationId: dto.applicationId,
        interviewerIds: dto.interviewerIds,
        type: dto.type || 'VIDEO',
        scheduledAt: new Date(dto.scheduledAt),
        status: InterviewStatus.SCHEDULED,
      },
    });

    await this.prisma.application.update({
      where: { id: dto.applicationId },
      data: { status: ApplicationStatus.INTERVIEW_SCHEDULED },
    });

    return interview;
  }

  async findAll(query: QueryInterviewDto, user: CurrentUserData) {
    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InterviewWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (user.role === UserRole.INTERVIEWER) {
      where.interviewerIds = {
        has: user.userId,
      };
    }

    const [interviews, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'desc' },
        include: {
          application: {
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
            },
          },
          scores: {
            select: {
              id: true,
              interviewerId: true,
              totalScore: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.interview.count({ where }),
    ]);

    return {
      data: interviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: CurrentUserData) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
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
            finalScore: true,
          },
        },
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
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (
      user.role === UserRole.INTERVIEWER &&
      !interview.interviewerIds.includes(user.userId)
    ) {
      throw new ForbiddenException('You are not assigned to this interview');
    }

    return interview;
  }

  async submitScore(id: string, dto: SubmitScoreDto, interviewerId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (!interview.interviewerIds.includes(interviewerId)) {
      throw new ForbiddenException('You are not assigned to this interview');
    }

    const existingScore = await this.prisma.interviewerScore.findUnique({
      where: {
        interviewId_interviewerId: {
          interviewId: id,
          interviewerId,
        },
      },
    });

    if (existingScore) {
      throw new ConflictException(
        'You have already submitted a score for this interview',
      );
    }

    const totalScore =
      dto.techDepth * 3 +
      dto.communication * 2 +
      dto.overallQuality * 2 +
      dto.cultureFit * 1;

    const score = await this.prisma.interviewerScore.create({
      data: {
        interviewId: id,
        interviewerId,
        techDepth: dto.techDepth,
        communication: dto.communication,
        overallQuality: dto.overallQuality,
        cultureFit: dto.cultureFit,
        totalScore,
        comments: dto.comments,
      },
    });

    return score;
  }

  async getScores(id: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const scores = await this.prisma.interviewerScore.findMany({
      where: { interviewId: id },
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
      orderBy: { createdAt: 'desc' },
    });

    return scores;
  }
}
