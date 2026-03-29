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
var ScoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const llm_service_1 = require("./llm/llm.service");
const mock_scoring_service_1 = require("./llm/mock-scoring.service");
const client_1 = require("@prisma/client");
let ScoringService = ScoringService_1 = class ScoringService {
    prisma;
    llmService;
    mockScoringService;
    logger = new common_1.Logger(ScoringService_1.name);
    constructor(prisma, llmService, mockScoringService) {
        this.prisma = prisma;
        this.llmService = llmService;
        this.mockScoringService = mockScoringService;
    }
    async scoreSubmission(submissionId) {
        this.logger.log(`Starting scoring for submission: ${submissionId}`);
        const submission = await this.prisma.examSubmission.findUnique({
            where: { id: submissionId },
        });
        if (!submission) {
            throw new common_1.NotFoundException(`Submission with ID "${submissionId}" not found`);
        }
        const question = await this.prisma.question.findUnique({
            where: { id: submission.questionId },
            select: {
                id: true,
                title: true,
                description: true,
                hiddenTestCases: true,
            },
        });
        if (!question) {
            throw new common_1.NotFoundException(`Question for submission "${submissionId}" not found`);
        }
        const submissionWithQuestion = {
            ...submission,
            question,
        };
        const existingScore = await this.prisma.aIScore.findUnique({
            where: { submissionId },
        });
        if (existingScore) {
            this.logger.log(`Submission ${submissionId} already scored, returning existing score`);
            return existingScore;
        }
        const scoringResult = await this.calculateScores(submissionWithQuestion);
        const aiScore = await this.prisma.aIScore.create({
            data: {
                submissionId,
                totalScore: scoringResult.totalScore,
                breakdown: scoringResult.breakdown,
                codeAnnotations: scoringResult.codeAnnotations,
                suggestedQuestions: scoringResult.suggestedQuestions,
                behaviorSummary: scoringResult.behaviorSummary,
            },
        });
        this.logger.log(`Scoring completed for submission ${submissionId}, total score: ${scoringResult.totalScore}`);
        return aiScore;
    }
    async scoreExam(examId) {
        this.logger.log(`Starting scoring for exam: ${examId}`);
        const exam = await this.prisma.exam.findUnique({
            where: { id: examId },
            include: {
                submissions: true,
            },
        });
        if (!exam) {
            throw new common_1.NotFoundException(`Exam with ID "${examId}" not found`);
        }
        for (const submission of exam.submissions) {
            try {
                await this.scoreSubmission(submission.id);
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                this.logger.error(`Failed to score submission ${submission.id}: ${errorMessage}`);
            }
        }
        await this.prisma.exam.update({
            where: { id: examId },
            data: { status: client_1.ExamStatus.SCORED },
        });
        this.logger.log(`Scoring completed for exam ${examId}`);
    }
    async getScore(submissionId) {
        return this.prisma.aIScore.findUnique({
            where: { submissionId },
        });
    }
    async getExamScores(examId) {
        const submissions = await this.prisma.examSubmission.findMany({
            where: { examId },
            select: { id: true },
        });
        const submissionIds = submissions.map((s) => s.id);
        return this.prisma.aIScore.findMany({
            where: {
                submissionId: {
                    in: submissionIds,
                },
            },
        });
    }
    async retryScore(submissionId) {
        await this.prisma.aIScore.deleteMany({
            where: { submissionId },
        });
        return this.scoreSubmission(submissionId);
    }
    async calculateScores(submission) {
        const testResults = submission.testResults || [];
        const code = submission.code;
        const question = submission.question;
        const useLLM = this.llmService.isAvailable();
        this.logger.log(`Using ${useLLM ? 'LLM' : 'Mock'} scoring for submission ${submission.id}`);
        const correctnessScore = this.calculateCorrectness(testResults);
        const [codeQuality, edgeCaseHandling, complexity, engineering, problemSolving,] = await Promise.all([
            this.evaluateCodeQuality(code, question, useLLM),
            this.evaluateEdgeCaseHandling(code, question, testResults, useLLM),
            this.evaluateComplexity(code, useLLM),
            this.evaluateEngineering(code, useLLM),
            this.evaluateProblemSolving(code, question, testResults, useLLM),
        ]);
        const breakdown = {
            correctness: {
                score: correctnessScore,
                maxScore: 10,
            },
            codeQuality: {
                score: codeQuality.score,
                maxScore: 5,
                highlights: codeQuality.highlights,
                issues: codeQuality.issues,
                analysis: codeQuality.analysis,
            },
            edgeCaseHandling: {
                score: edgeCaseHandling.score,
                maxScore: 5,
                highlights: edgeCaseHandling.highlights,
                issues: edgeCaseHandling.issues,
                analysis: edgeCaseHandling.analysis,
            },
            complexity: {
                score: complexity.score,
                maxScore: 5,
                timeComplexity: complexity.timeComplexity,
                spaceComplexity: complexity.spaceComplexity,
                analysis: complexity.analysis,
            },
            engineering: {
                score: engineering.score,
                maxScore: 20,
                projectStructure: engineering.projectStructure,
                modularity: engineering.modularity,
                maintainability: engineering.maintainability,
                testing: engineering.testing,
                analysis: engineering.analysis,
            },
            problemSolving: {
                score: problemSolving.score,
                maxScore: 15,
                problemDecomposition: problemSolving.problemDecomposition,
                debugging: problemSolving.debugging,
                multiApproach: problemSolving.multiApproach,
                analysis: problemSolving.analysis,
            },
        };
        const totalScore = Math.round((breakdown.correctness.score +
            breakdown.codeQuality.score +
            breakdown.edgeCaseHandling.score +
            breakdown.complexity.score +
            breakdown.engineering.score +
            breakdown.problemSolving.score) *
            10) / 10;
        const scores = {
            correctness: breakdown.correctness.score,
            codeQuality: breakdown.codeQuality.score,
            edgeCaseHandling: breakdown.edgeCaseHandling.score,
            complexity: breakdown.complexity.score,
            engineering: breakdown.engineering.score,
            problemSolving: breakdown.problemSolving.score,
        };
        const report = await this.generateReport(code, scores, useLLM);
        const behaviorSummary = this.calculateBehaviorSummary(submission.codingEvents);
        return {
            totalScore,
            breakdown,
            codeAnnotations: report.codeAnnotations,
            suggestedQuestions: report.suggestedQuestions,
            behaviorSummary,
        };
    }
    calculateCorrectness(testResults) {
        if (!testResults || testResults.length === 0) {
            return 0;
        }
        const passedTests = testResults.filter((t) => t.passed).length;
        const passRate = passedTests / testResults.length;
        return Math.round(passRate * 10 * 10) / 10;
    }
    async evaluateCodeQuality(code, question, useLLM) {
        if (!useLLM) {
            return this.mockScoringService.evaluateCodeQuality(code);
        }
        const prompt = `
请评审以下代码的质量（可读性、命名规范、代码结构）。

题目：${question.title}
题目描述：${question.description}

代码：
\`\`\`${code}
\`\`\`

请返回 JSON 格式：
{
  "score": 0-5,
  "highlights": ["..."],
  "issues": ["..."],
  "analysis": "..."
}
`;
        try {
            const response = await this.llmService.evaluateCode(prompt);
            return this.llmService.extractJSONFromResponse(response);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.logger.warn(`LLM code quality evaluation failed, falling back to mock: ${errorMessage}`);
            return this.mockScoringService.evaluateCodeQuality(code);
        }
    }
    async evaluateEdgeCaseHandling(code, question, testResults, useLLM) {
        if (!useLLM) {
            return this.mockScoringService.evaluateEdgeCaseHandling(code, testResults);
        }
        const passedTests = testResults.filter((t) => t.passed).length;
        const totalTests = testResults.length;
        const passRate = totalTests > 0 ? passedTests / totalTests : 0;
        const prompt = `
请评估以下代码的边界处理和异常处理能力。

题目：${question.title}
题目描述：${question.description}

代码：
\`\`\`${code}
\`\`\`

隐藏测试用例通过率：${(passRate * 100).toFixed(1)}%

请返回 JSON 格式：
{
  "score": 0-5,
  "highlights": ["..."],
  "issues": ["..."],
  "analysis": "..."
}
`;
        try {
            const response = await this.llmService.evaluateCode(prompt);
            return this.llmService.extractJSONFromResponse(response);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.logger.warn(`LLM edge case evaluation failed, falling back to mock: ${errorMessage}`);
            return this.mockScoringService.evaluateEdgeCaseHandling(code, testResults);
        }
    }
    async evaluateComplexity(code, useLLM) {
        if (!useLLM) {
            return this.mockScoringService.evaluateComplexity(code);
        }
        const prompt = `
请分析以下代码的时间复杂度和空间复杂度。

代码：
\`\`\`${code}
\`\`\`

请返回 JSON 格式：
{
  "score": 0-5,
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "analysis": "..."
}
`;
        try {
            const response = await this.llmService.evaluateCode(prompt);
            return this.llmService.extractJSONFromResponse(response);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.logger.warn(`LLM complexity evaluation failed, falling back to mock: ${errorMessage}`);
            return this.mockScoringService.evaluateComplexity(code);
        }
    }
    async evaluateEngineering(code, useLLM) {
        if (!useLLM) {
            return this.mockScoringService.evaluateEngineering(code);
        }
        const prompt = `
请评估以下代码的工程化水平（项目结构、模块化、可维护性、是否有测试）。

代码：
\`\`\`${code}
\`\`\`

请返回 JSON 格式：
{
  "score": 0-20,
  "projectStructure": 0-5,
  "modularity": 0-5,
  "maintainability": 0-5,
  "testing": 0-5,
  "analysis": "..."
}
`;
        try {
            const response = await this.llmService.evaluateCode(prompt);
            return this.llmService.extractJSONFromResponse(response);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.logger.warn(`LLM engineering evaluation failed, falling back to mock: ${errorMessage}`);
            return this.mockScoringService.evaluateEngineering(code);
        }
    }
    async evaluateProblemSolving(code, question, testResults, useLLM) {
        if (!useLLM) {
            return this.mockScoringService.evaluateProblemSolving(code, testResults);
        }
        const prompt = `
请评估候选人的问题解决能力（思路条理性、调试能力、多方案对比）。

题目：${question.title}
题目描述：${question.description}

代码：
\`\`\`${code}
\`\`\`

请返回 JSON 格式：
{
  "score": 0-15,
  "problemDecomposition": 0-5,
  "debugging": 0-5,
  "multiApproach": 0-5,
  "analysis": "..."
}
`;
        try {
            const response = await this.llmService.evaluateCode(prompt);
            return this.llmService.extractJSONFromResponse(response);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.logger.warn(`LLM problem solving evaluation failed, falling back to mock: ${errorMessage}`);
            return this.mockScoringService.evaluateProblemSolving(code, testResults);
        }
    }
    async generateReport(code, scores, useLLM) {
        if (!useLLM) {
            return this.mockScoringService.generateReport(code, scores);
        }
        const prompt = `
基于以下评分结果，生成 3 个针对性的面试追问问题，以及对代码的关键标注（亮点和问题各2-3个）。

评分：
- 代码正确性: ${scores.correctness}/10
- 代码质量: ${scores.codeQuality}/5
- 边界处理: ${scores.edgeCaseHandling}/5
- 复杂度分析: ${scores.complexity}/5
- 工程化思维: ${scores.engineering}/20
- 问题解决: ${scores.problemSolving}/15

代码：
\`\`\`${code}
\`\`\`

返回 JSON 格式：
{
  "suggestedQuestions": ["...", "...", "..."],
  "codeAnnotations": [
    { "line": n, "type": "highlight", "comment": "..." },
    { "line": n, "type": "issue", "comment": "..." }
  ]
}
`;
        try {
            const response = await this.llmService.evaluateCode(prompt);
            return this.llmService.extractJSONFromResponse(response);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.logger.warn(`LLM report generation failed, falling back to mock: ${errorMessage}`);
            return this.mockScoringService.generateReport(code, scores);
        }
    }
    calculateBehaviorSummary(codingEvents) {
        if (!codingEvents) {
            return undefined;
        }
        const events = codingEvents;
        if (!Array.isArray(events) || events.length === 0) {
            return undefined;
        }
        const codeEvents = events.filter((e) => e.type === 'code_change');
        if (codeEvents.length >= 2) {
            const firstEvent = new Date(codeEvents[0].timestamp);
            const lastEvent = new Date(codeEvents[codeEvents.length - 1].timestamp);
            const durationMinutes = (lastEvent.getTime() - firstEvent.getTime()) / 60000;
            if (durationMinutes > 0) {
                const totalChars = codeEvents.reduce((sum, e) => sum + (e.data?.codeLength || 0), 0);
                return {
                    codingSpeed: Math.round(totalChars / durationMinutes),
                    debugAttempts: events.filter((e) => e.type === 'run_code').length,
                    timeDistribution: this.calculateTimeDistribution(events),
                };
            }
        }
        return {
            debugAttempts: events.filter((e) => e.type === 'run_code').length,
            timeDistribution: this.calculateTimeDistribution(events),
        };
    }
    calculateTimeDistribution(events) {
        const distribution = {
            coding: 0,
            debugging: 0,
            idle: 0,
        };
        for (let i = 0; i < events.length - 1; i++) {
            const current = new Date(events[i].timestamp);
            const next = new Date(events[i + 1].timestamp);
            const duration = (next.getTime() - current.getTime()) / 1000;
            if (duration > 60) {
                distribution.idle += duration;
            }
            else if (events[i].type === 'run_code') {
                distribution.debugging += duration;
            }
            else {
                distribution.coding += duration;
            }
        }
        return distribution;
    }
};
exports.ScoringService = ScoringService;
exports.ScoringService = ScoringService = ScoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_service_1.LLMService,
        mock_scoring_service_1.MockScoringService])
], ScoringService);
//# sourceMappingURL=scoring.service.js.map