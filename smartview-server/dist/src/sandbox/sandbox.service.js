"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SandboxService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SandboxService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let SandboxService = SandboxService_1 = class SandboxService {
    logger = new common_1.Logger(SandboxService_1.name);
    tempDir = '/tmp/smartview-sandbox';
    timeoutMs = 30000;
    maxBuffer = 10 * 1024 * 1024;
    constructor() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }
    async runCode(dto) {
        const { code, language, testCases } = dto;
        const fileExtension = this.getFileExtension(language);
        const tempFileName = `code_${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension}`;
        const tempFilePath = path.join(this.tempDir, tempFileName);
        try {
            fs.writeFileSync(tempFilePath, code);
            if (testCases && testCases.length > 0) {
                return await this.runWithTestCases(tempFilePath, language, testCases);
            }
            else {
                return await this.executeCode(tempFilePath, language);
            }
        }
        finally {
            this.cleanupTempFile(tempFilePath);
        }
    }
    async runWithTestCases(filePath, language, testCases) {
        const testResults = [];
        let combinedStdout = '';
        let combinedStderr = '';
        let totalExecutionTime = 0;
        let hasTimeout = false;
        let lastExitCode = 0;
        for (const testCase of testCases) {
            const result = await this.executeCodeWithInput(filePath, language, testCase.input);
            combinedStdout += result.stdout;
            combinedStderr += result.stderr;
            totalExecutionTime += result.executionTime;
            if (result.timedOut) {
                hasTimeout = true;
            }
            if (result.exitCode !== 0) {
                lastExitCode = result.exitCode;
            }
            const actualOutput = result.stdout.trim();
            const passed = actualOutput === testCase.expectedOutput.trim();
            testResults.push({
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput,
                passed,
            });
        }
        return {
            stdout: combinedStdout,
            stderr: combinedStderr,
            exitCode: lastExitCode,
            timedOut: hasTimeout,
            executionTime: totalExecutionTime,
            testResults,
        };
    }
    async executeCode(filePath, language) {
        return this.executeCodeWithInput(filePath, language, '');
    }
    async executeCodeWithInput(filePath, language, input) {
        const command = this.getCommand(language);
        const args = this.getCommandArgs(language, filePath);
        return new Promise((resolve) => {
            const startTime = Date.now();
            let stdout = '';
            let stderr = '';
            let timedOut = false;
            const child = (0, child_process_1.spawn)(command, args, {
                cwd: this.tempDir,
                env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=512' },
            });
            const timeout = setTimeout(() => {
                timedOut = true;
                child.kill('SIGTERM');
                setTimeout(() => {
                    if (!child.killed) {
                        child.kill('SIGKILL');
                    }
                }, 5000);
            }, this.timeoutMs);
            child.stdout.on('data', (data) => {
                const chunk = data.toString();
                if (stdout.length + chunk.length <= this.maxBuffer) {
                    stdout += chunk;
                }
                else {
                    stdout += chunk.substring(0, this.maxBuffer - stdout.length);
                }
            });
            child.stderr.on('data', (data) => {
                const chunk = data.toString();
                if (stderr.length + chunk.length <= this.maxBuffer) {
                    stderr += chunk;
                }
                else {
                    stderr += chunk.substring(0, this.maxBuffer - stderr.length);
                }
            });
            child.on('close', (exitCode) => {
                clearTimeout(timeout);
                const executionTime = Date.now() - startTime;
                resolve({
                    stdout,
                    stderr,
                    exitCode: exitCode ?? 1,
                    timedOut,
                    executionTime,
                });
            });
            child.on('error', (error) => {
                clearTimeout(timeout);
                const executionTime = Date.now() - startTime;
                resolve({
                    stdout,
                    stderr: stderr + `\nProcess error: ${error.message}`,
                    exitCode: 1,
                    timedOut,
                    executionTime,
                });
            });
            if (input) {
                child.stdin.write(input);
            }
            child.stdin.end();
        });
    }
    getFileExtension(language) {
        switch (language) {
            case 'javascript':
                return '.js';
            case 'typescript':
                return '.ts';
            case 'python':
                return '.py';
            default:
                return '.txt';
        }
    }
    getCommand(language) {
        switch (language) {
            case 'javascript':
            case 'typescript':
                return 'node';
            case 'python':
                return 'python3';
            default:
                return 'node';
        }
    }
    getCommandArgs(language, filePath) {
        return [filePath];
    }
    cleanupTempFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        catch (error) {
            this.logger.error(`Failed to cleanup temp file: ${filePath}`, error);
        }
    }
};
exports.SandboxService = SandboxService;
exports.SandboxService = SandboxService = SandboxService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SandboxService);
//# sourceMappingURL=sandbox.service.js.map