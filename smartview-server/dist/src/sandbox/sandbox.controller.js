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
exports.SandboxController = void 0;
const common_1 = require("@nestjs/common");
const sandbox_service_1 = require("./sandbox.service");
const run_code_dto_1 = require("./dto/run-code.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SandboxController = class SandboxController {
    sandboxService;
    constructor(sandboxService) {
        this.sandboxService = sandboxService;
    }
    async runCode(runCodeDto) {
        const result = await this.sandboxService.runCode(runCodeDto);
        return {
            success: true,
            data: result,
        };
    }
};
exports.SandboxController = SandboxController;
__decorate([
    (0, common_1.Post)('run'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [run_code_dto_1.RunCodeDto]),
    __metadata("design:returntype", Promise)
], SandboxController.prototype, "runCode", null);
exports.SandboxController = SandboxController = __decorate([
    (0, common_1.Controller)('api/sandbox'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [sandbox_service_1.SandboxService])
], SandboxController);
//# sourceMappingURL=sandbox.controller.js.map