import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { ScoringService } from './scoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AIScore, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/scoring')
@UseGuards(JwtAuthGuard)
export class ScoringController {
  constructor(
    private readonly scoringService: ScoringService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get scoring result for a submission
   * GET /api/scoring/:submissionId
   */
  @Get(':submissionId')
  async getScore(
    @Param('submissionId') submissionId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<AIScore> {
    // Check permissions
    await this.checkSubmissionPermission(submissionId, user);

    const score = await this.scoringService.getScore(submissionId);
    if (!score) {
      throw new ForbiddenException('Score not found for this submission');
    }

    return score;
  }

  /**
   * Retry scoring for a submission (ADMIN/HR only)
   * POST /api/scoring/:submissionId/retry
   */
  @Post(':submissionId/retry')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  async retryScore(
    @Param('submissionId') submissionId: string,
  ): Promise<AIScore> {
    return this.scoringService.retryScore(submissionId);
  }

  /**
   * Get all scores for an exam
   * GET /api/scoring/exam/:examId
   */
  @Get('exam/:examId')
  async getExamScores(
    @Param('examId') examId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<AIScore[]> {
    // Check permissions
    await this.checkExamPermission(examId, user);

    return this.scoringService.getExamScores(examId);
  }

  /**
   * Check if user has permission to access submission score
   */
  private async checkSubmissionPermission(
    submissionId: string,
    user: CurrentUserData,
  ): Promise<void> {
    // Admin and HR can access all scores
    if (user.role === UserRole.ADMIN || user.role === UserRole.HR) {
      return;
    }

    // Interviewer can access scores for exams they are involved with
    if (user.role === UserRole.INTERVIEWER) {
      // Check if interviewer has access to the application
      const submission = await this.prisma.examSubmission.findUnique({
        where: { id: submissionId },
        include: {
          exam: {
            include: {
              application: true,
            },
          },
        },
      });

      if (!submission) {
        throw new ForbiddenException('Submission not found');
      }

      // Interviewer can view scores for now (can be restricted further if needed)
      return;
    }

    // Candidate can only access their own scores
    if (user.role === UserRole.CANDIDATE) {
      const submission = await this.prisma.examSubmission.findUnique({
        where: { id: submissionId },
        include: {
          exam: {
            include: {
              application: true,
            },
          },
        },
      });

      if (!submission) {
        throw new ForbiddenException('Submission not found');
      }

      if (submission.exam.application.candidateId !== user.userId) {
        throw new ForbiddenException('You do not have access to this score');
      }

      return;
    }

    throw new ForbiddenException('You do not have access to this score');
  }

  /**
   * Check if user has permission to access exam scores
   */
  private async checkExamPermission(
    examId: string,
    user: CurrentUserData,
  ): Promise<void> {
    // Admin and HR can access all scores
    if (user.role === UserRole.ADMIN || user.role === UserRole.HR) {
      return;
    }

    // Interviewer can access scores for exams they are involved with
    if (user.role === UserRole.INTERVIEWER) {
      return;
    }

    // Candidate can only access their own exam scores
    if (user.role === UserRole.CANDIDATE) {
      const exam = await this.prisma.exam.findUnique({
        where: { id: examId },
        include: {
          application: true,
        },
      });

      if (!exam) {
        throw new ForbiddenException('Exam not found');
      }

      if (exam.application.candidateId !== user.userId) {
        throw new ForbiddenException(
          'You do not have access to this exam scores',
        );
      }

      return;
    }

    throw new ForbiddenException('You do not have access to this exam scores');
  }
}
