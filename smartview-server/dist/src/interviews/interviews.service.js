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
exports.InterviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let InterviewsService = class InterviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const application = await this.prisma.application.findUnique({
            where: { id: dto.applicationId },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const interview = await this.prisma.interview.create({
            data: {
                applicationId: dto.applicationId,
                interviewerIds: dto.interviewerIds,
                type: dto.type || 'VIDEO',
                scheduledAt: new Date(dto.scheduledAt),
                status: client_1.InterviewStatus.SCHEDULED,
            },
        });
        await this.prisma.application.update({
            where: { id: dto.applicationId },
            data: { status: client_1.ApplicationStatus.INTERVIEW_SCHEDULED },
        });
        return interview;
    }
    async findAll(query, user) {
        const { status, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (user.role === client_1.UserRole.INTERVIEWER) {
            where.interviewerIds = {
                has: user.userId,
            };
        }
        const [interviews, total] = await Promise.all([
            this.prisma.interview.findMany({
                where,
                skip,
                take: limit,
                orderBy: { scheduledAt: 'desc' },
                include: {
                    application: {
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
                        },
                    },
                    scores: {
                        select: {
                            id: true,
                            interviewerId: true,
                            totalScore: true,
                            createdAt: true,
                        },
                    },
                },
            }),
            this.prisma.interview.count({ where }),
        ]);
        return {
            data: interviews,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, user) {
        const interview = await this.prisma.interview.findUnique({
            where: { id },
            include: {
                application: {
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
                        finalScore: true,
                    },
                },
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
        });
        if (!interview) {
            throw new common_1.NotFoundException('Interview not found');
        }
        if (user.role === client_1.UserRole.INTERVIEWER &&
            !interview.interviewerIds.includes(user.userId)) {
            throw new common_1.ForbiddenException('You are not assigned to this interview');
        }
        return interview;
    }
    async submitScore(id, dto, interviewerId) {
        const interview = await this.prisma.interview.findUnique({
            where: { id },
        });
        if (!interview) {
            throw new common_1.NotFoundException('Interview not found');
        }
        if (!interview.interviewerIds.includes(interviewerId)) {
            throw new common_1.ForbiddenException('You are not assigned to this interview');
        }
        const existingScore = await this.prisma.interviewerScore.findUnique({
            where: {
                interviewId_interviewerId: {
                    interviewId: id,
                    interviewerId,
                },
            },
        });
        if (existingScore) {
            throw new common_1.ConflictException('You have already submitted a score for this interview');
        }
        const totalScore = dto.techDepth * 3 +
            dto.communication * 2 +
            dto.overallQuality * 2 +
            dto.cultureFit * 1;
        const score = await this.prisma.interviewerScore.create({
            data: {
                interviewId: id,
                interviewerId,
                techDepth: dto.techDepth,
                communication: dto.communication,
                overallQuality: dto.overallQuality,
                cultureFit: dto.cultureFit,
                totalScore,
                comments: dto.comments,
            },
        });
        return score;
    }
    async getScores(id) {
        const interview = await this.prisma.interview.findUnique({
            where: { id },
        });
        if (!interview) {
            throw new common_1.NotFoundException('Interview not found');
        }
        const scores = await this.prisma.interviewerScore.findMany({
            where: { interviewId: id },
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
            orderBy: { createdAt: 'desc' },
        });
        return scores;
    }
};
exports.InterviewsService = InterviewsService;
exports.InterviewsService = InterviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InterviewsService);
//# sourceMappingURL=interviews.service.js.map