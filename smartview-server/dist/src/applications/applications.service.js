"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ApplicationsService = class ApplicationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, candidateId) {
        const job = await this.prisma.job.findUnique({
            where: { id: dto.jobId },
        });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        const existingApplication = await this.prisma.application.findFirst({
            where: {
                candidateId,
                jobId: dto.jobId,
            },
        });
        if (existingApplication) {
            throw new common_1.ForbiddenException('You have already applied for this job');
        }
        const application = await this.prisma.application.create({
            data: {
                candidateId,
                jobId: dto.jobId,
                status: client_1.ApplicationStatus.PENDING,
            },
        });
        return application;
    }
    async findAll(query, user) {
        const { status, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (user.role === client_1.UserRole.CANDIDATE) {
            where.candidateId = user.userId;
        }
        const [applications, total] = await Promise.all([
            this.prisma.application.findMany({
                where,
                skip,
                take: limit,
                orderBy: { appliedAt: 'desc' },
                include: {
                    candidate: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                    job: {
                        select: {
                            id: true,
                            title: true,
                            company: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    finalScore: {
                        select: {
                            id: true,
                            finalScore: true,
                            decision: true,
                        },
                    },
                    _count: {
                        select: {
                            exams: true,
                            interviews: true,
                        },
                    },
                },
            }),
            this.prisma.application.count({ where }),
        ]);
        return {
            data: applications,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, user) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                candidate: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        phone: true,
                    },
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        requirements: true,
                        company: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                exams: {
                    include: {
                        submissions: {
                            include: {
                                aiScore: true,
                            },
                        },
                    },
                },
                interviews: {
                    include: {
                        scores: {
                            include: {
                                interviewer: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                },
                finalScore: true,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (user.role === client_1.UserRole.CANDIDATE &&
            application.candidateId !== user.userId) {
            throw new common_1.ForbiddenException('You can only view your own applications');
        }
        return application;
    }
    async finalize(id) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                exams: {
                    include: {
                        submissions: {
                            include: {
                                aiScore: true,
                            },
                        },
                    },
                },
                interviews: {
                    include: {
                        scores: true,
                    },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const aiScores = [];
        application.exams.forEach((exam) => {
            exam.submissions.forEach((submission) => {
                if (submission.aiScore) {
                    aiScores.push(submission.aiScore.totalScore);
                }
            });
        });
        const aiScore = aiScores.length > 0
            ? aiScores.reduce((sum, score) => sum + score, 0) / aiScores.length
            : 0;
        const interviewerScores = [];
        application.interviews.forEach((interview) => {
            interview.scores.forEach((score) => {
                interviewerScores.push(score.totalScore);
            });
        });
        const interviewerScore = interviewerScores.length > 0
            ? interviewerScores.reduce((sum, score) => sum + score, 0) /
                interviewerScores.length
            : 0;
        const finalScoreValue = aiScore + interviewerScore;
        let decision;
        if (finalScoreValue >= 80) {
            decision = client_1.Decision.RECOMMEND;
        }
        else if (finalScoreValue >= 65) {
            decision = client_1.Decision.MAYBE;
        }
        else {
            decision = client_1.Decision.REJECT;
        }
        const finalScore = await this.prisma.finalScore.upsert({
            where: { applicationId: id },
            create: {
                applicationId: id,
                aiScore,
                interviewerScore,
                finalScore: finalScoreValue,
                decision,
            },
            update: {
                aiScore,
                interviewerScore,
                finalScore: finalScoreValue,
                decision,
            },
        });
        await this.prisma.application.update({
            where: { id },
            data: { status: client_1.ApplicationStatus.INTERVIEW_COMPLETED },
        });
        return finalScore;
    }
    async updateDecision(id, dto) {
        const application = await this.prisma.application.findUnique({
            where: { id },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const finalScore = await this.prisma.finalScore.upsert({
            where: { applicationId: id },
            create: {
                applicationId: id,
                aiScore: 0,
                interviewerScore: 0,
                finalScore: 0,
                decision: dto.decision,
            },
            update: {
                decision: dto.decision,
            },
        });
        return finalScore;
    }
    async getReport(id) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                candidate: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        phone: true,
                    },
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        company: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                exams: {
                    include: {
                        submissions: {
                            include: {
                                aiScore: true,
                            },
                        },
                    },
                },
                interviews: {
                    include: {
                        scores: {
                            include: {
                                interviewer: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                },
                finalScore: true,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const aiScores = [];
        application.exams.forEach((exam) => {
            exam.submissions.forEach((submission) => {
                if (submission.aiScore) {
                    aiScores.push({
                        questionId: submission.questionId,
                        totalScore: submission.aiScore.totalScore,
                        breakdown: submission.aiScore.breakdown,
                        codeAnnotations: submission.aiScore.codeAnnotations,
                        suggestedQuestions: submission.aiScore.suggestedQuestions,
                        behaviorSummary: submission.aiScore.behaviorSummary,
                    });
                }
            });
        });
        const aiScoreAvg = aiScores.length > 0
            ? aiScores.reduce((sum, s) => sum + s.totalScore, 0) / aiScores.length
            : 0;
        const interviewerScores = application.interviews.flatMap((i) => i.scores);
        const interviewerScoreAvg = interviewerScores.length > 0
            ? interviewerScores.reduce((sum, s) => sum + s.totalScore, 0) /
                interviewerScores.length
            : 0;
        const finalScoreValue = aiScoreAvg + interviewerScoreAvg;
        const deviation = Math.abs(aiScoreAvg - interviewerScoreAvg);
        const needsReview = deviation > 20;
        return {
            candidate: application.candidate,
            job: application.job,
            aiScores,
            interviewerScores: interviewerScores.map((s) => ({
                id: s.id,
                interviewer: s.interviewer,
                techDepth: s.techDepth,
                communication: s.communication,
                overallQuality: s.overallQuality,
                cultureFit: s.cultureFit,
                totalScore: s.totalScore,
                comments: s.comments,
                createdAt: s.createdAt,
            })),
            summary: {
                aiScore: aiScoreAvg,
                interviewerScore: interviewerScoreAvg,
                finalScore: finalScoreValue,
                decision: application.finalScore?.decision || null,
                deviation,
                needsReview,
            },
        };
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map