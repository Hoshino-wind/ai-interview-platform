import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QueryQuestionDto } from './dto/query-question.dto';
export declare class QuestionsController {
    private readonly questionsService;
    constructor(questionsService: QuestionsService);
    create(createQuestionDto: CreateQuestionDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.QuestionType;
            difficulty: import("@prisma/client").$Enums.Difficulty;
            title: string;
            description: string;
            starterCode: import("@prisma/client/runtime/client").JsonValue | null;
            testCases: import("@prisma/client/runtime/client").JsonValue;
            hiddenTestCases: import("@prisma/client/runtime/client").JsonValue | null;
            evaluationRubric: import("@prisma/client/runtime/client").JsonValue | null;
            timeLimit: number;
            tags: string[];
            languageSupport: string[];
            aiScoringConfig: import("@prisma/client/runtime/client").JsonValue | null;
        };
    }>;
    findAll(queryDto: QueryQuestionDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.QuestionType;
            difficulty: import("@prisma/client").$Enums.Difficulty;
            title: string;
            description: string;
            starterCode: import("@prisma/client/runtime/client").JsonValue | null;
            testCases: import("@prisma/client/runtime/client").JsonValue;
            hiddenTestCases: import("@prisma/client/runtime/client").JsonValue | null;
            evaluationRubric: import("@prisma/client/runtime/client").JsonValue | null;
            timeLimit: number;
            tags: string[];
            languageSupport: string[];
            aiScoringConfig: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.QuestionType;
            difficulty: import("@prisma/client").$Enums.Difficulty;
            title: string;
            description: string;
            starterCode: import("@prisma/client/runtime/client").JsonValue | null;
            testCases: import("@prisma/client/runtime/client").JsonValue;
            hiddenTestCases: import("@prisma/client/runtime/client").JsonValue | null;
            evaluationRubric: import("@prisma/client/runtime/client").JsonValue | null;
            timeLimit: number;
            tags: string[];
            languageSupport: string[];
            aiScoringConfig: import("@prisma/client/runtime/client").JsonValue | null;
        };
    }>;
    update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.QuestionType;
            difficulty: import("@prisma/client").$Enums.Difficulty;
            title: string;
            description: string;
            starterCode: import("@prisma/client/runtime/client").JsonValue | null;
            testCases: import("@prisma/client/runtime/client").JsonValue;
            hiddenTestCases: import("@prisma/client/runtime/client").JsonValue | null;
            evaluationRubric: import("@prisma/client/runtime/client").JsonValue | null;
            timeLimit: number;
            tags: string[];
            languageSupport: string[];
            aiScoringConfig: import("@prisma/client/runtime/client").JsonValue | null;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
