import { QuestionType, Difficulty } from '@prisma/client';
export declare class QueryQuestionDto {
    page?: string;
    limit?: string;
    type?: QuestionType;
    difficulty?: Difficulty;
    tags?: string;
    language?: string;
    search?: string;
}
