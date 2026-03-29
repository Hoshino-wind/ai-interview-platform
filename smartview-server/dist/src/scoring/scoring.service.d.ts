import { PrismaService } from '../prisma/prisma.service';
import { LLMService } from './llm/llm.service';
import { MockScoringService } from './llm/mock-scoring.service';
import { AIScore } from '@prisma/client';
export declare class ScoringService {
    private readonly prisma;
    private readonly llmService;
    private readonly mockScoringService;
    private readonly logger;
    constructor(prisma: PrismaService, llmService: LLMService, mockScoringService: MockScoringService);
    scoreSubmission(submissionId: string): Promise<AIScore>;
    scoreExam(examId: string): Promise<void>;
    getScore(submissionId: string): Promise<AIScore | null>;
    getExamScores(examId: string): Promise<AIScore[]>;
    retryScore(submissionId: string): Promise<AIScore>;
    private calculateScores;
    private calculateCorrectness;
    private evaluateCodeQuality;
    private evaluateEdgeCaseHandling;
    private evaluateComplexity;
    private evaluateEngineering;
    private evaluateProblemSolving;
    private generateReport;
    private calculateBehaviorSummary;
    private calculateTimeDistribution;
}
