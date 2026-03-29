import { ExamsService } from './exams.service';
import { SandboxService } from '../sandbox/sandbox.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitCodeDto } from './dto/submit-code.dto';
import { type CurrentUserData } from '../common/decorators/current-user.decorator';
export declare class ExamsController {
    private readonly examsService;
    private readonly sandboxService;
    constructor(examsService: ExamsService, sandboxService: SandboxService);
    create(createExamDto: CreateExamDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            timeLimit: number;
            applicationId: string;
            questionIds: string[];
            status: import("@prisma/client").$Enums.ExamStatus;
            startedAt: Date | null;
            submittedAt: Date | null;
        };
    }>;
    findOne(id: string, user: CurrentUserData): Promise<{
        success: boolean;
        data: unknown;
    }>;
    startExam(id: string, user: CurrentUserData): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            timeLimit: number;
            applicationId: string;
            questionIds: string[];
            status: import("@prisma/client").$Enums.ExamStatus;
            startedAt: Date | null;
            submittedAt: Date | null;
        };
    }>;
    saveSubmission(id: string, questionId: string, user: CurrentUserData, submitCodeDto: SubmitCodeDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            language: string;
            code: string;
            testResults: import("@prisma/client/runtime/client").JsonValue | null;
            examId: string;
            questionId: string;
            codingEvents: import("@prisma/client/runtime/client").JsonValue | null;
        };
    }>;
    runCode(id: string, questionId: string, user: CurrentUserData, submitCodeDto: SubmitCodeDto): Promise<{
        success: boolean;
        data: import("../sandbox/sandbox.service").RunCodeResult;
    }>;
    submitExam(id: string, user: CurrentUserData): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            timeLimit: number;
            applicationId: string;
            questionIds: string[];
            status: import("@prisma/client").$Enums.ExamStatus;
            startedAt: Date | null;
            submittedAt: Date | null;
        };
        message: string;
    }>;
    getStatus(id: string, user: CurrentUserData): Promise<{
        success: boolean;
        data: {
            status: import("@prisma/client").ExamStatus;
            startedAt: Date | null;
            submittedAt: Date | null;
            timeRemaining: number | null;
        };
    }>;
}
