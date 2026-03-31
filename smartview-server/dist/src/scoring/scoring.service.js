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
const llm_service_1 = require("../llm/llm.service");
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
            include: {
                exam: {
                    include: {
                        application: {
                            include: {
                                job: true,
                            },
                        },
                    },
                },
            },
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
            id: submission.id,
            examId: submission.examId,
            questionId: submission.questionId,
            code: submission.code,
            language: submission.language,
            testResults: submission.testResults,
            codingEvents: submission.codingEvents,
            question,
        };
        const jobRequirements = submission.exam.application.job
            ? {
                title: submission.exam.application.job.title,
                description: submission.exam.application.job.description,
                requirements: submission.exam.application.job.requirements,
                tags: submission.exam.application.job.tags,
            }
            : undefined;
        const existingScore = await this.prisma.aIScore.findUnique({
            where: { submissionId },
        });
        if (existingScore) {
            this.logger.log(`Submission ${submissionId} already scored, returning existing score`);
            return existingScore;
        }
        const scoringResult = await this.calculateScores(submissionWithQuestion, jobRequirements);
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
                application: {
                    include: {
                        job: true,
                    },
                },
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
    async calculateScores(submission, jobRequirements) {
        const testResults = submission.testResults || [];
        const code = submission.code;
        const question = submission.question;
        const codingEvents = submission.codingEvents;
        const useLLM = this.llmService.isAvailable();
        this.logger.log(`Using ${useLLM ? 'LLM' : 'Mock'} scoring for submission ${submission.id}`);
        const deliveryQuality = await this.evaluateDeliveryQuality(testResults, code, question, useLLM);
        const codeQuality = await this.evaluateCodeQuality(code, question, useLLM);
        const problemSolving = await this.evaluateProblemSolving(code, question, codingEvents, useLLM);
        const toolUsage = this.evaluateToolUsage(codingEvents);
        const engineering = await this.evaluateEngineering(code, useLLM);
        const techMatch = await this.evaluateTechMatch(code, useLLM, jobRequirements);
        const breakdown = {
            deliveryQuality,
            codeQuality,
            problemSolving,
            toolUsage,
            engineering,
            techMatch,
        };
        const totalScore = Math.round(deliveryQuality.score +
            codeQuality.score +
            problemSolving.score +
            toolUsage.score +
            engineering.score +
            techMatch.score);
        const scores = {
            deliveryQuality: deliveryQuality.score,
            codeQuality: codeQuality.score,
            problemSolving: problemSolving.score,
            toolUsage: toolUsage.score,
            engineering: engineering.score,
            techMatch: techMatch.score,
        };
        const report = await this.generateReport(code, scores, useLLM);
        const behaviorSummary = this.calculateBehaviorSummary(codingEvents);
        return {
            totalScore,
            breakdown,
            codeAnnotations: report.codeAnnotations,
            suggestedQuestions: report.suggestedQuestions,
            behaviorSummary,
        };
    }
    async evaluateDeliveryQuality(testResults, code, question, useLLM) {
        const totalTests = testResults.length || 0;
        const passedTests = testResults.filter((t) => t.passed).length;
        const passRate = totalTests > 0 ? passedTests / totalTests : 0;
        const testScore = Math.round(passRate * 20 * 10) / 10;
        let edgeCaseScore = 0;
        let highlights = [];
        let issues = [];
        let analysis = '';
        if (useLLM) {
            const prompt = `
请评估以下代码的边界处理和异常处理能力，给出0-5分的评分。

题目：${question.title}
题目描述：${question.description}

代码：
\`\`\`
${code}
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
                const result = this.llmService.extractJSONFromResponse(response);
                edgeCaseScore = Math.min(5, Math.max(0, result.score || 0));
                highlights = result.highlights || [];
                issues = result.issues || [];
                analysis = result.analysis || '';
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                this.logger.warn(`LLM edge case evaluation failed, falling back to mock: ${errorMessage}`);
                const mockResult = this.mockScoringService.evaluateEdgeCaseHandling(code, testResults);
                edgeCaseScore = Math.min(5, mockResult.score || 0);
                highlights = mockResult.highlights || [];
                issues = mockResult.issues || [];
                analysis = mockResult.analysis || '';
            }
        }
        else {
            const mockResult = this.mockScoringService.evaluateEdgeCaseHandling(code, testResults);
            edgeCaseScore = Math.min(5, mockResult.score || 0);
            highlights = mockResult.highlights || [];
            issues = mockResult.issues || [];
            analysis = mockResult.analysis || '';
        }
        const totalScore = Math.min(25, Math.round((testScore + edgeCaseScore) * 10) / 10);
        return {
            score: totalScore,
            maxScore: 25,
            testPassRate: `${passedTests}/${totalTests}`,
            edgeCases: Math.round(edgeCaseScore * 10) / 10,
            highlights,
            issues,
            analysis,
        };
    }
    async evaluateCodeQuality(code, question, useLLM) {
        if (!useLLM) {
            return this.mockScoringService.evaluateCodeQualityNew(code);
        }
        const prompt = `
请评审以下代码的质量，从可读性、命名规范、代码结构三个维度评分（每项0-5分）。

题目：${question.title}
题目描述：${question.description}

代码：
\`\`\`
${code}
\`\`\`

请返回 JSON 格式：
{
  "score": 0-15,
  "readability": 0-5,
  "naming": 0-5,
  "structure": 0-5,
  "highlights": ["..."],
  "issues": ["..."],
  "analysis": "..."
}
`;
        try {
            const response = await this.llmService.evaluateCode(prompt);
            const result = this.llmService.extractJSONFromResponse(response);
            return {
                score: Math.min(15, Math.max(0, result.score || 0)),
                maxScore: 15,
                readability: Math.min(5, Math.max(0, result.readability || 0)),
                naming: Math.min(5, Math.max(0, result.naming || 0)),
                structure: Math.min(5, Math.max(0, result.structure || 0)),
                highlights: result.highlights || [],
                issues: result.issues || [],
                analysis: result.analysis || '',
            };
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.logger.warn(`LLM code quality evaluation failed, falling back to mock: ${errorMessage}`);
            return this.mockScoringService.evaluateCodeQualityNew(code);
        }
    }
    async evaluateProblemSolving(code, question, codingEvents, useLLM) {
        const events = codingEvents || [];
        const eventAnalysis = this.analyzeCodingEvents(events);
        if (!useLLM) {
            return this.mockScoringService.evaluateProblemSolvingNew(code, eventAnalysis);
        }
        const prompt = `
请评估候选人的问题解决能力，分析以下编码行为数据。

题目：${question.title}
题目描述：${question.description}

代码：
\`\`\`
${code}
\`\`\`

编码行为统计：
- 运行代码次数: ${eventAnalysis.runCodeCount}
- 代码修改次数: ${eventAnalysis.codeChangeCount}
- 思考停顿次数: ${eventAnalysis.thinkingPauses}
- 调试时间占比: ${eventAnalysis.debugTimeRatio.toFixed(1)}%
- 编码时间占比: ${eventAnalysis.codingTimeRatio.toFixed(1)}%
- 总耗时: ${eventAnalysis.totalDuration}秒

请返回 JSON 格式：
{
  "score": 0-20,
  "thinkingClarity": 0-7,
  "debugStrategy": 0-7,
  "iterativeImprovement": 0-6,
  "analysis": "..."
}
`;
        try {
            const response = await this.llmService.evaluateCode(prompt);
            const result = this.llmService.extractJSONFromResponse(response);
            return {
                score: Math.min(20, Math.max(0, result.score || 0)),
                maxScore: 20,
                thinkingClarity: Math.min(7, Math.max(0, result.thinkingClarity || 0)),
                debugStrategy: Math.min(7, Math.max(0, result.debugStrategy || 0)),
                iterativeImprovement: Math.min(6, Math.max(0, result.iterativeImprovement || 0)),
                analysis: result.analysis || '',
            };
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.logger.warn(`LLM problem solving evaluation failed, falling back to mock: ${errorMessage}`);
            return this.mockScoringService.evaluateProblemSolvingNew(code, eventAnalysis);
        }
    }
    evaluateToolUsage(codingEvents) {
        const events = codingEvents || [];
        const pasteEvents = events.filter((e) => e.type === 'paste');
        const pasteCount = pasteEvents.length;
        const tabSwitches = events.filter((e) => e.type === 'tab_away');
        const tabReturns = events.filter((e) => e.type === 'tab_return');
        const tabSwitchCount = tabSwitches.length;
        let totalTabAwayDuration = 0;
        let tabAwayCount = 0;
        for (let i = 0; i < events.length - 1; i++) {
            if (events[i].type === 'tab_away') {
                for (let j = i + 1; j < events.length; j++) {
                    if (events[j].type === 'tab_return') {
                        const away = new Date(events[i].timestamp).getTime();
                        const returned = new Date(events[j].timestamp).getTime();
                        totalTabAwayDuration += (returned - away) / 1000;
                        tabAwayCount++;
                        break;
                    }
                }
            }
        }
        const avgTabAwayDuration = tabAwayCount > 0 ? Math.round(totalTabAwayDuration / tabAwayCount) : 0;
        let blindPasteCount = 0;
        let efficientPasteCount = 0;
        for (let i = 0; i < events.length; i++) {
            if (events[i].type === 'paste') {
                const pasteContent = events[i].data?.content || '';
                const pasteLength = pasteContent.length;
                let hasModification = false;
                const pasteTime = new Date(events[i].timestamp).getTime();
                for (let j = i + 1; j < events.length; j++) {
                    const nextTime = new Date(events[j].timestamp).getTime();
                    if (nextTime - pasteTime > 30000)
                        break;
                    if (events[j].type === 'keystroke' || events[j].type === 'code_change') {
                        hasModification = true;
                        break;
                    }
                }
                if (pasteLength > 200 && !hasModification) {
                    blindPasteCount++;
                }
                else if (pasteLength > 50 && hasModification) {
                    efficientPasteCount++;
                }
            }
        }
        const runCodeCount = events.filter((e) => e.type === 'run_code').length;
        const keystrokeCount = events.filter((e) => e.type === 'keystroke').length;
        let codingPattern;
        if (pasteCount > 5 && blindPasteCount > 2) {
            codingPattern = 'paste_heavy';
        }
        else if (tabSwitchCount > 3 && efficientPasteCount > 1) {
            codingPattern = 'research_driven';
        }
        else if (runCodeCount > 5) {
            codingPattern = 'iterative';
        }
        else {
            codingPattern = 'think_first';
        }
        let toolEfficiency;
        let score = 0;
        let assessment = '';
        if (codingPattern === 'research_driven' && efficientPasteCount >= blindPasteCount) {
            toolEfficiency = 'high';
            score = 12 + Math.random() * 3;
            assessment = '候选人善于利用外部资源，能够高效地查阅资料并应用到代码中。';
        }
        else if (codingPattern === 'think_first' && pasteCount <= 2) {
            toolEfficiency = 'high';
            score = 11 + Math.random() * 3;
            assessment = '候选人倾向于先思考再编码，较少依赖外部资源，代码质量稳定。';
        }
        else if (codingPattern === 'iterative' && runCodeCount > 3) {
            toolEfficiency = 'medium';
            score = 9 + Math.random() * 3;
            assessment = '候选人采用迭代式开发，频繁测试验证，但工具使用效率有提升空间。';
        }
        else if (codingPattern === 'paste_heavy') {
            toolEfficiency = 'low';
            score = 3 + Math.random() * 5;
            assessment = '检测到大量粘贴行为，部分代码可能未经理解直接使用，建议关注代码理解深度。';
        }
        else {
            toolEfficiency = 'medium';
            score = 8 + Math.random() * 4;
            assessment = '候选人工具使用能力中等，能够完成编码任务，但使用外部资源的方式可以更加高效。';
        }
        return {
            score: Math.min(15, Math.round(score * 10) / 10),
            maxScore: 15,
            pasteEvents: pasteCount,
            tabSwitches: tabSwitchCount,
            avgTabAwayDuration: `${avgTabAwayDuration}s`,
            codingPattern,
            toolEfficiency,
            assessment,
        };
    }
    async evaluateEngineering(code, useLLM) {
        if (!useLLM) {
            return this.mockScoringService.evaluateEngineeringNew(code);
        }
        const prompt = `
请评估以下代码的工程化水平，从错误处理、性能考量、模块化三个维度评分（每项0-5分）。

代码：
\`\`\`
${code}
\`\`\`

请返回 JSON 格式：
{
  "score": 0-15,
  "errorHandling": 0-5,
  "performance": 0-5,
  "modularity": 0-5,
  "analysis": "..."
}
`;
        try {
            const response = await this.llmService.evaluateCode(prompt);
            const result = this.llmService.extractJSONFromResponse(response);
            return {
                score: Math.min(15, Math.max(0, result.score || 0)),
                maxScore: 15,
                errorHandling: Math.min(5, Math.max(0, result.errorHandling || 0)),
                performance: Math.min(5, Math.max(0, result.performance || 0)),
                modularity: Math.min(5, Math.max(0, result.modularity || 0)),
                analysis: result.analysis || '',
            };
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.logger.warn(`LLM engineering evaluation failed, falling back to mock: ${errorMessage}`);
            return this.mockScoringService.evaluateEngineeringNew(code);
        }
    }
    async evaluateTechMatch(code, useLLM, jobRequirements) {
        if (!jobRequirements) {
            return {
                score: 5,
                maxScore: 10,
                matchedSkills: [],
                missingSkills: [],
                analysis: '未找到岗位要求信息，无法评估技术匹配度。',
            };
        }
        if (!useLLM) {
            return this.mockScoringService.evaluateTechMatch(code, jobRequirements);
        }
        const prompt = `
请评估候选人代码中使用的技术是否匹配岗位要求，给出0-10分的评分。

岗位要求：
- 职位：${jobRequirements.title}
- 描述：${jobRequirements.description}
- 要求：${jobRequirements.requirements}
- 标签：${jobRequirements.tags.join(', ')}

候选人代码：
\`\`\`
${code}
\`\`\`

请返回 JSON 格式：
{
  "score": 0-10,
  "matchedSkills": ["匹配的技术1", "匹配的技术2"],
  "missingSkills": ["缺失的技术1", "缺失的技术2"],
  "analysis": "..."
}
`;
        try {
            const response = await this.llmService.evaluateCode(prompt);
            const result = this.llmService.extractJSONFromResponse(response);
            return {
                score: Math.min(10, Math.max(0, result.score || 0)),
                maxScore: 10,
                matchedSkills: result.matchedSkills || [],
                missingSkills: result.missingSkills || [],
                analysis: result.analysis || '',
            };
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.logger.warn(`LLM tech match evaluation failed, falling back to mock: ${errorMessage}`);
            return this.mockScoringService.evaluateTechMatch(code, jobRequirements);
        }
    }
    analyzeCodingEvents(events) {
        if (!events || events.length === 0) {
            return {
                runCodeCount: 0,
                codeChangeCount: 0,
                thinkingPauses: 0,
                debugTimeRatio: 0,
                codingTimeRatio: 0,
                totalDuration: 0,
            };
        }
        const runCodeCount = events.filter((e) => e.type === 'run_code').length;
        const codeChangeCount = events.filter((e) => e.type === 'code_change').length;
        let thinkingPauses = 0;
        let debugTime = 0;
        let codingTime = 0;
        let totalDuration = 0;
        for (let i = 0; i < events.length - 1; i++) {
            const current = new Date(events[i].timestamp).getTime();
            const next = new Date(events[i + 1].timestamp).getTime();
            const duration = (next - current) / 1000;
            totalDuration += duration;
            if (duration > 10) {
                thinkingPauses++;
            }
            if (events[i].type === 'run_code') {
                debugTime += duration;
            }
            else if (events[i].type === 'code_change' || events[i].type === 'keystroke') {
                codingTime += duration;
            }
        }
        const debugTimeRatio = totalDuration > 0 ? (debugTime / totalDuration) * 100 : 0;
        const codingTimeRatio = totalDuration > 0 ? (codingTime / totalDuration) * 100 : 0;
        return {
            runCodeCount,
            codeChangeCount,
            thinkingPauses,
            debugTimeRatio,
            codingTimeRatio,
            totalDuration: Math.round(totalDuration),
        };
    }
    async generateReport(code, scores, useLLM) {
        if (!useLLM) {
            return this.mockScoringService.generateReportNew(code, scores);
        }
        const prompt = `
基于以下评分结果，生成 3 个针对性的面试追问问题，以及对代码的关键标注（亮点和问题各2-3个）。

评分：
- 最终交付质量: ${scores.deliveryQuality}/25
- 代码工程质量: ${scores.codeQuality}/15
- 问题解决过程: ${scores.problemSolving}/20
- 工具使用能力: ${scores.toolUsage}/15
- 工程化思维: ${scores.engineering}/15
- 技术匹配度: ${scores.techMatch}/10

代码：
\`\`\`
${code}
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
            return this.mockScoringService.generateReportNew(code, scores);
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
        let codingSpeed = 0;
        if (codeEvents.length >= 2) {
            const firstEvent = new Date(codeEvents[0].timestamp);
            const lastEvent = new Date(codeEvents[codeEvents.length - 1].timestamp);
            const durationMinutes = (lastEvent.getTime() - firstEvent.getTime()) / 60000;
            if (durationMinutes > 0) {
                const totalChars = codeEvents.reduce((sum, e) => sum + (e.data?.codeLength || 0), 0);
                codingSpeed = Math.round(totalChars / durationMinutes);
            }
        }
        const pasteEvents = events.filter((e) => e.type === 'paste').length;
        const tabSwitches = events.filter((e) => e.type === 'tab_away').length;
        let totalTabAwayDuration = 0;
        let tabAwayCount = 0;
        for (let i = 0; i < events.length - 1; i++) {
            if (events[i].type === 'tab_away') {
                for (let j = i + 1; j < events.length; j++) {
                    if (events[j].type === 'tab_return') {
                        const away = new Date(events[i].timestamp).getTime();
                        const returned = new Date(events[j].timestamp).getTime();
                        totalTabAwayDuration += (returned - away) / 1000;
                        tabAwayCount++;
                        break;
                    }
                }
            }
        }
        const avgTabAwayDuration = tabAwayCount > 0 ? `${Math.round(totalTabAwayDuration / tabAwayCount)}s` : '0s';
        const runCodeCount = events.filter((e) => e.type === 'run_code').length;
        let codingPattern = 'unknown';
        if (pasteEvents > 5) {
            codingPattern = 'paste_heavy';
        }
        else if (tabSwitches > 3) {
            codingPattern = 'research_driven';
        }
        else if (runCodeCount > 5) {
            codingPattern = 'iterative';
        }
        else {
            codingPattern = 'think_first';
        }
        return {
            codingSpeed,
            debugAttempts: events.filter((e) => e.type === 'run_code').length,
            timeDistribution: this.calculateTimeDistribution(events),
            toolUsageStats: {
                pasteEvents,
                tabSwitches,
                avgTabAwayDuration,
                codingPattern,
            },
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