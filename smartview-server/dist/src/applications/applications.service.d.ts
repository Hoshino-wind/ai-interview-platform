import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateDecisionDto } from './dto/update-decision.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { Prisma } from '@prisma/client';
import { CurrentUserData } from '../common/decorators/current-user.decorator';
export declare class ApplicationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateApplicationDto, candidateId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        candidateId: string;
        jobId: string;
        appliedAt: Date;
    }>;
    findAll(query: QueryApplicationDto, user: CurrentUserData): Promise<{
        data: ({
            job: {
                id: string;
                company: {
                    id: string;
                    name: string;
                };
                title: string;
            };
            finalScore: {
                id: string;
                finalScore: number;
                decision: import("@prisma/client").$Enums.Decision;
            } | null;
            _count: {
                exams: number;
                interviews: number;
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, user: CurrentUserData): Promise<{
        job: {
            id: string;
            company: {
                id: string;
                name: string;
            };
            title: string;
            description: string;
            requirements: string;
        };
        finalScore: {
            id: string;
            createdAt: Date;
            interviewerScore: number;
            finalScore: number;
            aiScore: number;
            applicationId: string;
            decision: import("@prisma/client").$Enums.Decision;
            report: Prisma.JsonValue | null;
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
                    breakdown: Prisma.JsonValue;
                    codeAnnotations: Prisma.JsonValue | null;
                    suggestedQuestions: string[];
                    behaviorSummary: Prisma.JsonValue | null;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                language: string;
                code: string;
                testResults: Prisma.JsonValue | null;
                examId: string;
                questionId: string;
                codingEvents: Prisma.JsonValue | null;
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
        interviews: ({
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
        })[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        candidateId: string;
        jobId: string;
        appliedAt: Date;
    }>;
    finalize(id: string): Promise<{
        id: string;
        createdAt: Date;
        interviewerScore: number;
        finalScore: number;
        aiScore: number;
        applicationId: string;
        decision: import("@prisma/client").$Enums.Decision;
        report: Prisma.JsonValue | null;
    }>;
    updateDecision(id: string, dto: UpdateDecisionDto): Promise<{
        id: string;
        createdAt: Date;
        interviewerScore: number;
        finalScore: number;
        aiScore: number;
        applicationId: string;
        decision: import("@prisma/client").$Enums.Decision;
        report: Prisma.JsonValue | null;
    }>;
    getReport(id: string): Promise<{
        candidate: {
            id: string;
            email: string;
            phone: string | null;
            name: string;
            avatar: string | null;
        };
        job: {
            id: string;
            company: {
                id: string;
                name: string;
            };
            title: string;
            description: string;
        };
        aiScores: {
            questionId: string;
            totalScore: number;
            breakdown: Prisma.JsonValue;
            codeAnnotations: Prisma.JsonValue;
            suggestedQuestions: string[];
            behaviorSummary: Prisma.JsonValue;
        }[];
        interviewerScores: {
            id: string;
            interviewer: {
                id: string;
                email: string;
                name: string;
                avatar: string | null;
            };
            techDepth: number;
            communication: number;
            overallQuality: number;
            cultureFit: number;
            totalScore: number;
            comments: string | null;
            createdAt: Date;
        }[];
        summary: {
            aiScore: number;
            interviewerScore: number;
            finalScore: number;
            decision: import("@prisma/client").$Enums.Decision | null;
            deviation: number;
            needsReview: boolean;
        };
    }>;
}
