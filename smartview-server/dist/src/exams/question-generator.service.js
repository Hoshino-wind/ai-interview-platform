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
var QuestionGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const llm_service_1 = require("../llm/llm.service");
const client_1 = require("@prisma/client");
let QuestionGeneratorService = QuestionGeneratorService_1 = class QuestionGeneratorService {
    prisma;
    llmService;
    logger = new common_1.Logger(QuestionGeneratorService_1.name);
    constructor(prisma, llmService) {
        this.prisma = prisma;
        this.llmService = llmService;
    }
    async generateQuestions(applicationId) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                candidate: {
                    include: { resumes: true },
                },
                job: true,
            },
        });
        if (!application) {
            throw new Error(`Application with ID "${applicationId}" not found`);
        }
        const resume = application.candidate.resumes[0];
        const parsedData = resume?.parsedData;
        const job = application.job;
        if (this.llmService.isAvailable()) {
            try {
                return await this.generateWithLLM(parsedData, job);
            }
            catch (error) {
                this.logger.warn(`LLM generation failed, falling back to mock: ${error instanceof Error ? error.message : String(error)}`);
                return this.generateMockQuestions(parsedData, job);
            }
        }
        else {
            this.logger.log('LLM not available, using mock question generation');
            return this.generateMockQuestions(parsedData, job);
        }
    }
    async generateWithLLM(parsedData, job) {
        const prompt = `你是一名高级技术面试官。根据以下信息生成编码考试题目：

【候选人简历】
技术栈: ${JSON.stringify(parsedData?.skills || [])}
工作经验: ${JSON.stringify(parsedData?.experience || [])}
项目经历: ${JSON.stringify(parsedData?.projects || [])}
经验年限: ${parsedData?.yearsOfExperience || '未知'}
经验等级: ${parsedData?.seniorityLevel || '未知'}

【岗位要求】
职位: ${job.title}
描述: ${job.description}
要求: ${job.requirements}

请生成 2-3 道编码题目，要求：
1. 题目必须与候选人的技术栈相关（使用候选人熟悉的语言/框架）
2. 难度匹配候选人经验水平
3. 题目类型覆盖：实际业务场景题（基于候选人行业背景）、系统设计编码题、调试/重构题
4. 每道题都是开放式的，允许多种解法，鼓励使用任何工具
5. 提供评分标准（侧重解决问题的过程和最终交付质量）

返回严格 JSON 格式（不要 markdown）：
[{
  "title": "题目标题",
  "description": "详细题目描述，包括背景、要求、示例",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "estimatedTime": 30,
  "evaluationCriteria": "评分标准描述",
  "starterCode": "// 起始代码模板",
  "testCases": "// 测试用例代码",
  "relatedSkills": ["来自简历的相关技能"]
}]`;
        const response = await this.llmService.evaluateCode(prompt);
        return this.parseGeneratedQuestions(response);
    }
    parseGeneratedQuestions(response) {
        try {
            let jsonStr = response;
            const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1].trim();
            }
            const jsonArrayMatch = jsonStr.match(/\[[\s\S]*\]/);
            if (jsonArrayMatch) {
                jsonStr = jsonArrayMatch[0];
            }
            const questions = JSON.parse(jsonStr);
            return questions.map((q) => ({
                ...q,
                difficulty: (q.difficulty?.toUpperCase() || 'MEDIUM'),
            }));
        }
        catch (error) {
            this.logger.error(`Failed to parse LLM response: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error('Failed to parse generated questions from LLM response');
        }
    }
    generateMockQuestions(parsedData, job) {
        const skills = parsedData?.skills || ['JavaScript'];
        const level = parsedData?.seniorityLevel || 'mid';
        const questions = [];
        const frontendSkills = skills.filter((s) => ['React', 'Vue', 'Angular', 'Next.js', 'TypeScript', 'JavaScript'].includes(s));
        const backendSkills = skills.filter((s) => [
            'Node.js',
            'Python',
            'Java',
            'Go',
            'NestJS',
            'Express',
            'Django',
            'Spring',
        ].includes(s));
        if (frontendSkills.length > 0) {
            questions.push({
                title: '实时数据仪表板组件',
                description: `基于您在 ${frontendSkills.join('/')} 的经验...

设计并实现一个实时数据仪表板组件，要求：
1. 展示实时更新的数据卡片
2. 支持数据过滤和排序
3. 包含基本的图表展示（可用文本模拟）
4. 合理的组件拆分和状态管理
5. 错误处理和加载状态

您可以自由使用任何工具和资源来完成此题。`,
                difficulty: level === 'senior' || level === 'expert' ? 'HARD' : 'MEDIUM',
                estimatedTime: 45,
                evaluationCriteria: '组件设计、状态管理、代码可读性、错误处理',
                starterCode: '// 请使用您熟悉的技术栈实现\n\n',
                testCases: '',
                relatedSkills: frontendSkills.slice(0, 5),
            });
        }
        else if (backendSkills.length > 0) {
            questions.push({
                title: 'API 限流中间件',
                description: `基于您在后端开发的经验...

设计并实现一个 API 限流中间件，要求：
1. 支持按 IP 和按用户 ID 限流
2. 支持滑动窗口算法
3. 可配置限流规则（每分钟请求数、每小时请求数）
4. 超限时返回合适的 HTTP 状态码和响应
5. 考虑分布式环境下的方案

您可以自由使用任何工具和资源。`,
                difficulty: level === 'senior' || level === 'expert' ? 'HARD' : 'MEDIUM',
                estimatedTime: 40,
                evaluationCriteria: '算法正确性、可扩展性、代码质量、分布式考量',
                starterCode: '// 请使用您熟悉的语言/框架实现\n\n',
                testCases: '',
                relatedSkills: backendSkills.slice(0, 5),
            });
        }
        else {
            questions.push({
                title: '任务调度器',
                description: `设计并实现一个任务调度器...

要求：
1. 支持添加定时任务（延迟执行、周期执行）
2. 支持取消任务
3. 支持任务优先级
4. 并发安全
5. 合理的错误处理

您可以使用任何语言和工具。`,
                difficulty: 'MEDIUM',
                estimatedTime: 40,
                evaluationCriteria: '设计合理性、并发处理、代码质量',
                starterCode: '// 请使用您最熟悉的语言实现\n\n',
                testCases: '',
                relatedSkills: skills.slice(0, 3),
            });
        }
        questions.push({
            title: '代码重构挑战',
            description: `以下代码存在多个问题（性能问题、可维护性差、缺少错误处理等）。
请重构此代码并说明改进理由。

\`\`\`javascript
function processOrders(orders) {
  var results = [];
  for (var i = 0; i < orders.length; i++) {
    var order = orders[i];
    var total = 0;
    for (var j = 0; j < order.items.length; j++) {
      total = total + order.items[j].price * order.items[j].quantity;
      if (order.items[j].price * order.items[j].quantity > 100) {
        order.items[j].discount = true;
      }
    }
    order.total = total;
    if (total > 500) {
      order.status = "premium";
      order.discount = total * 0.1;
    }
    if (total > 200) {
      order.status = "standard";
      order.discount = total * 0.05;
    }
    results.push(order);
  }
  return results;
}
\`\`\`

请从以下方面进行优化：代码可读性、性能、错误处理、类型安全、单元测试。

鼓励使用任何工具辅助分析和重构。`,
            difficulty: 'MEDIUM',
            estimatedTime: 30,
            evaluationCriteria: '问题识别能力、重构质量、解释清晰度',
            starterCode: '// 原始代码已在题目描述中\n// 请在此处编写重构后的代码\n\n',
            testCases: '',
            relatedSkills: ['JavaScript', 'TypeScript'],
        });
        if (job.requirements && job.requirements.length > 0) {
            questions.push({
                title: `${job.title} - 业务场景题`,
                description: `基于您申请的职位 "${job.title}" 的要求：

${job.description}

请设计并实现一个解决方案，满足以下核心需求：
${job.requirements.substring(0, 500)}${job.requirements.length > 500 ? '...' : ''}

要求：
1. 分析业务需求，设计合理的技术方案
2. 实现核心功能代码
3. 考虑边界情况和错误处理
4. 提供简洁的使用说明

您可以自由使用任何工具、框架和资源。`,
                difficulty: level === 'expert' ? 'HARD' : level === 'senior' ? 'MEDIUM' : 'EASY',
                estimatedTime: 50,
                evaluationCriteria: '需求理解、方案设计、实现质量、文档完整性',
                starterCode: '// 请基于您的技术栈实现解决方案\n\n',
                testCases: '',
                relatedSkills: skills.slice(0, 5),
            });
        }
        return questions;
    }
    mapDifficulty(difficulty) {
        switch (difficulty?.toUpperCase()) {
            case 'EASY':
                return client_1.Difficulty.L1;
            case 'MEDIUM':
                return client_1.Difficulty.L2;
            case 'HARD':
                return client_1.Difficulty.L3;
            default:
                return client_1.Difficulty.L2;
        }
    }
    determineQuestionType(title, description) {
        const lowerTitle = title.toLowerCase();
        const lowerDesc = description.toLowerCase();
        if (lowerTitle.includes('重构') ||
            lowerTitle.includes('refactor') ||
            lowerDesc.includes('重构')) {
            return client_1.QuestionType.REFACTOR;
        }
        if (lowerTitle.includes('调试') ||
            lowerTitle.includes('debug') ||
            lowerDesc.includes('debug')) {
            return client_1.QuestionType.DEBUG;
        }
        if (lowerTitle.includes('系统设计') ||
            lowerTitle.includes('system design') ||
            lowerDesc.includes('系统设计')) {
            return client_1.QuestionType.SYSTEM_DESIGN;
        }
        if (lowerTitle.includes('项目') ||
            lowerTitle.includes('project') ||
            lowerDesc.includes('业务场景')) {
            return client_1.QuestionType.PROJECT;
        }
        return client_1.QuestionType.ALGORITHM;
    }
};
exports.QuestionGeneratorService = QuestionGeneratorService;
exports.QuestionGeneratorService = QuestionGeneratorService = QuestionGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_service_1.LLMService])
], QuestionGeneratorService);
//# sourceMappingURL=question-generator.service.js.map