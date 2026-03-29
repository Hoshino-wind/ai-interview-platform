import type { CurrentUserData } from '../common/decorators/current-user.decorator';
import { ScoringService } from './scoring.service';
import { AIScore } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class ScoringController {
    private readonly scoringService;
    private readonly prisma;
    constructor(scoringService: ScoringService, prisma: PrismaService);
    getScore(submissionId: string, user: CurrentUserData): Promise<AIScore>;
    retryScore(submissionId: string): Promise<AIScore>;
    getExamScores(examId: string, user: CurrentUserData): Promise<AIScore[]>;
    private checkSubmissionPermission;
    private checkExamPermission;
}
