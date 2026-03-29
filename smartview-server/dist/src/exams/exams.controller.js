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
exports.ExamsController = void 0;
const common_1 = require("@nestjs/common");
const exams_service_1 = require("./exams.service");
const sandbox_service_1 = require("../sandbox/sandbox.service");
const create_exam_dto_1 = require("./dto/create-exam.dto");
const submit_code_dto_1 = require("./dto/submit-code.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let ExamsController = class ExamsController {
    examsService;
    sandboxService;
    constructor(examsService, sandboxService) {
        this.examsService = examsService;
        this.sandboxService = sandboxService;
    }
    async create(createExamDto) {
        const exam = await this.examsService.create(createExamDto);
        return {
            success: true,
            data: exam,
        };
    }
    async findOne(id, user) {
        const result = await this.examsService.findOne(id, user);
        return {
            success: true,
            data: result,
        };
    }
    async startExam(id, user) {
        const exam = await this.examsService.startExam(id, user);
        return {
            success: true,
            data: exam,
        };
    }
    async saveSubmission(id, questionId, user, submitCodeDto) {
        const submission = await this.examsService.saveSubmission(id, questionId, user, submitCodeDto);
        return {
            success: true,
            data: submission,
        };
    }
    async runCode(id, questionId, user, submitCodeDto) {
        const result = await this.examsService.runCode(id, questionId, user, submitCodeDto);
        return {
            success: true,
            data: result,
        };
    }
    async submitExam(id, user) {
        const result = await this.examsService.submitExam(id, user);
        return {
            success: true,
            data: result.exam,
            message: result.message,
        };
    }
    async getStatus(id, user) {
        const status = await this.examsService.getStatus(id, user);
        return {
            success: true,
            data: status,
        };
    }
};
exports.ExamsController = ExamsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.HR),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_exam_dto_1.CreateExamDto]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "startExam", null);
__decorate([
    (0, common_1.Put)(':id/submissions/:questionId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('questionId', common_1.ParseUUIDPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, submit_code_dto_1.SubmitCodeDto]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "saveSubmission", null);
__decorate([
    (0, common_1.Post)(':id/submissions/:questionId/run'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('questionId', common_1.ParseUUIDPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, submit_code_dto_1.SubmitCodeDto]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "runCode", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "submitExam", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getStatus", null);
exports.ExamsController = ExamsController = __decorate([
    (0, common_1.Controller)('api/exams'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [exams_service_1.ExamsService,
        sandbox_service_1.SandboxService])
], ExamsController);
//# sourceMappingURL=exams.controller.js.map