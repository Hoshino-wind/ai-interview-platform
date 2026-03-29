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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringController = void 0;
const common_1 = require("@nestjs/common");
const scoring_service_1 = require("./scoring.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let ScoringController = class ScoringController {
    scoringService;
    prisma;
    constructor(scoringService, prisma) {
        this.scoringService = scoringService;
        this.prisma = prisma;
    }
    async getScore(submissionId, user) {
        await this.checkSubmissionPermission(submissionId, user);
        const score = await this.scoringService.getScore(submissionId);
        if (!score) {
            throw new common_1.ForbiddenException('Score not found for this submission');
        }
        return score;
    }
    async retryScore(submissionId) {
        return this.scoringService.retryScore(submissionId);
    }
    async getExamScores(examId, user) {
        await this.checkExamPermission(examId, user);
        return this.scoringService.getExamScores(examId);
    }
    async checkSubmissionPermission(submissionId, user) {
        if (user.role === client_1.UserRole.ADMIN || user.role === client_1.UserRole.HR) {
            return;
        }
        if (user.role === client_1.UserRole.INTERVIEWER) {
            const submission = await this.prisma.examSubmission.findUnique({
                where: { id: submissionId },
                include: {
                    exam: {
                        include: {
                            application: true,
                        },
                    },
                },
            });
            if (!submission) {
                throw new common_1.ForbiddenException('Submission not found');
            }
            return;
        }
        if (user.role === client_1.UserRole.CANDIDATE) {
            const submission = await this.prisma.examSubmission.findUnique({
                where: { id: submissionId },
                include: {
                    exam: {
                        include: {
                            application: true,
                        },
                    },
                },
            });
            if (!submission) {
                throw new common_1.ForbiddenException('Submission not found');
            }
            if (submission.exam.application.candidateId !== user.userId) {
                throw new common_1.ForbiddenException('You do not have access to this score');
            }
            return;
        }
        throw new common_1.ForbiddenException('You do not have access to this score');
    }
    async checkExamPermission(examId, user) {
        if (user.role === client_1.UserRole.ADMIN || user.role === client_1.UserRole.HR) {
            return;
        }
        if (user.role === client_1.UserRole.INTERVIEWER) {
            return;
        }
        if (user.role === client_1.UserRole.CANDIDATE) {
            const exam = await this.prisma.exam.findUnique({
                where: { id: examId },
                include: {
                    application: true,
                },
            });
            if (!exam) {
                throw new common_1.ForbiddenException('Exam not found');
            }
            if (exam.application.candidateId !== user.userId) {
                throw new common_1.ForbiddenException('You do not have access to this exam scores');
            }
            return;
        }
        throw new common_1.ForbiddenException('You do not have access to this exam scores');
    }
};
exports.ScoringController = ScoringController;
__decorate([
    (0, common_1.Get)(':submissionId'),
    __param(0, (0, common_1.Param)('submissionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScoringController.prototype, "getScore", null);
__decorate([
    (0, common_1.Post)(':submissionId/retry'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.HR),
    __param(0, (0, common_1.Param)('submissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScoringController.prototype, "retryScore", null);
__decorate([
    (0, common_1.Get)('exam/:examId'),
    __param(0, (0, common_1.Param)('examId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScoringController.prototype, "getExamScores", null);
exports.ScoringController = ScoringController = __decorate([
    (0, common_1.Controller)('api/scoring'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [scoring_service_1.ScoringService,
        prisma_service_1.PrismaService])
], ScoringController);
//# sourceMappingURL=scoring.controller.js.map