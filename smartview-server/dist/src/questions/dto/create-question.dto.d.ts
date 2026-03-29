import { QuestionType, Difficulty } from '@prisma/client';
export declare class CreateQuestionDto {
    title: string;
    description: string;
    type: QuestionType;
    difficulty: Difficulty;
    starterCode?: Record<string, string>;
    testCases: Array<{
        input: string;
        expectedOutput: string;
        isHidden?: boolean;
    }>;
    hiddenTestCases?: Array<{
        input: string;
        expectedOutput: string;
    }>;
    evaluationRubric?: Record<string, number>;
    timeLimit?: number;
    tags?: string[];
    languageSupport?: string[];
    aiScoringConfig?: Record<string, unknown>;
}
