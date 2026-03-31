import { PrismaService } from '../prisma/prisma.service';
import { LLMService } from '../llm/llm.service';
import { Difficulty, QuestionType } from '@prisma/client';
export interface GeneratedQuestion {
    title: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    estimatedTime: number;
    evaluationCriteria: string;
    starterCode: string;
    testCases: string;
    relatedSkills: string[];
}
export declare class QuestionGeneratorService {
    private readonly prisma;
    private readonly llmService;
    private readonly logger;
    constructor(prisma: PrismaService, llmService: LLMService);
    generateQuestions(applicationId: string): Promise<GeneratedQuestion[]>;
    private generateWithLLM;
    private parseGeneratedQuestions;
    private generateMockQuestions;
    mapDifficulty(difficulty: string): Difficulty;
    determineQuestionType(title: string, description: string): QuestionType;
}
