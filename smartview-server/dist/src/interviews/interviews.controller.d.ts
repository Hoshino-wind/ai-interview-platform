import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { SubmitScoreDto } from './dto/submit-score.dto';
import { QueryInterviewDto } from './dto/query-interview.dto';
import { type CurrentUserData } from '../common/decorators/current-user.decorator';
export declare class InterviewsController {
    private readonly interviewsService;
    constructor(interviewsService: InterviewsService);
    create(dto: CreateInterviewDto): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.InterviewType;
        applicationId: string;
        status: import("@prisma/client").$Enums.InterviewStatus;
        interviewerIds: string[];
        scheduledAt: Date;
    }>;
    findAll(query: QueryInterviewDto, user: CurrentUserData): Promise<{
        data: ({
            application: {
                job: {
                    id: string;
                    company: {
                        id: string;
                        name: string;
                    };
                    title: string;
                };
                candidate: {
                    id: string;
                    email: string;
                    name: string;
                    avatar: string | null;
                };
            } & {
                id: string;
                status: import("@prisma/client").$Enums.ApplicationStatus;
                candidateId: string;
                jobId: string;
                appliedAt: Date;
            };
            scores: {
                id: string;
                createdAt: Date;
                totalScore: number;
                interviewerId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.InterviewType;
            applicationId: string;
            status: import("@prisma/client").$Enums.InterviewStatus;
            interviewerIds: string[];
            scheduledAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, user: CurrentUserData): Promise<{
        application: {
            job: {
                id: string;
                company: {
                    id: string;
                    name: string;
                };
                title: string;
                description: string;
            };
            finalScore: {
                id: string;
                createdAt: Date;
                interviewerScore: number;
                finalScore: number;
                aiScore: number;
                applicationId: string;
                decision: import("@prisma/client").$Enums.Decision;
                report: import("@prisma/client/runtime/client").JsonValue | null;
            } | null;
            candidate: {
                id: string;
                email: string;
                phone: string | null;
                name: string;
                avatar: string | null;
            };
            exams: ({
                submissions: ({
                    aiScore: {
                        id: string;
                        createdAt: Date;
                        submissionId: string;
                        totalScore: number;
                        breakdown: import("@prisma/client/runtime/client").JsonValue;
                        codeAnnotations: import("@prisma/client/runtime/client").JsonValue | null;
                        suggestedQuestions: string[];
                        behaviorSummary: import("@prisma/client/runtime/client").JsonValue | null;
                    } | null;
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    language: string;
                    code: string;
                    testResults: import("@prisma/client/runtime/client").JsonValue | null;
                    examId: string;
                    questionId: string;
                    codingEvents: import("@prisma/client/runtime/client").JsonValue | null;
                })[];
            } & {
                id: string;
                createdAt: Date;
                timeLimit: number;
                applicationId: string;
                questionIds: string[];
                status: import("@prisma/client").$Enums.ExamStatus;
                startedAt: Date | null;
                submittedAt: Date | null;
            })[];
        } & {
            id: string;
            status: import("@prisma/client").$Enums.ApplicationStatus;
            candidateId: string;
            jobId: string;
            appliedAt: Date;
        };
        scores: ({
            interviewer: {
                id: string;
                email: string;
                name: string;
                avatar: string | null;
            };
        } & {
            comments: string | null;
            id: string;
            createdAt: Date;
            totalScore: number;
            techDepth: number;
            communication: number;
            overallQuality: number;
            cultureFit: number;
            interviewId: string;
            interviewerId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.InterviewType;
        applicationId: string;
        status: import("@prisma/client").$Enums.InterviewStatus;
        interviewerIds: string[];
        scheduledAt: Date;
    }>;
    submitScore(id: string, dto: SubmitScoreDto, user: CurrentUserData): Promise<{
        comments: string | null;
        id: string;
        createdAt: Date;
        totalScore: number;
        techDepth: number;
        communication: number;
        overallQuality: number;
        cultureFit: number;
        interviewId: string;
        interviewerId: string;
    }>;
    getScores(id: string): Promise<({
        interviewer: {
            id: string;
            email: string;
            name: string;
            avatar: string | null;
        };
    } & {
        comments: string | null;
        id: string;
        createdAt: Date;
        totalScore: number;
        techDepth: number;
        communication: number;
        overallQuality: number;
        cultureFit: number;
        interviewId: string;
        interviewerId: string;
    })[]>;
}
