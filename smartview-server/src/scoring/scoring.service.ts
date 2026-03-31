import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LLMService } from '../llm/llm.service';
import { MockScoringService } from './llm/mock-scoring.service';
import {
  ScoringResult,
  ScoringBreakdown,
  LLMEvaluationResponse,
  CodeAnnotation,
  DeliveryQualityDimension,
  CodeQualityDimension,
  ProblemSolvingDimension,
  ToolUsageDimension,
  EngineeringDimension,
  TechMatchDimension,
} from './dto/scoring-result.dto';
import { AIScore, ExamStatus, Prisma } from '@prisma/client';

interface TestResult {
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string;
}

interface QuestionData {
  id: string;
  title: string;
  description: string;
  hiddenTestCases?: Prisma.JsonValue;
}

interface SubmissionWithQuestion {
  id: string;
  examId: string;
  questionId: string;
  code: string;
  language: string;
  testResults: Prisma.JsonValue;
  codingEvents: Prisma.JsonValue | null;
  question: QuestionData;
}

interface CodingEvent {
  type: string;
  timestamp: string;
  data?: {
    codeLength?: number;
    content?: string;
    duration?: number;
  };
}

interface JobRequirements {
  title: string;
  description: string;
  requirements: string;
  tags: string[];
}

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
    private readonly mockScoringService: MockScoringService,
  ) {}

  /**
   * Score a single submission
   */
  async scoreSubmission(submissionId: string): Promise<AIScore> {
    this.logger.log(`Starting scoring for submission: ${submissionId}`);

    // Load submission with exam and job info
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
      throw new NotFoundException(
        `Submission with ID "${submissionId}" not found`,
      );
    }

    // Load question info separately
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
      throw new NotFoundException(
        `Question for submission "${submissionId}" not found`,
      );
    }

    const submissionWithQuestion: SubmissionWithQuestion = {
      id: submission.id,
      examId: submission.examId,
      questionId: submission.questionId,
      code: submission.code,
      language: submission.language,
      testResults: submission.testResults,
      codingEvents: submission.codingEvents,
      question,
    };

    // Get job requirements for tech match evaluation
    const jobRequirements: JobRequirements | undefined = submission.exam.application.job
      ? {
          title: submission.exam.application.job.title,
          description: submission.exam.application.job.description,
          requirements: submission.exam.application.job.requirements,
          tags: submission.exam.application.job.tags,
        }
      : undefined;

    // Check if already scored
    const existingScore = await this.prisma.aIScore.findUnique({
      where: { submissionId },
    });

    if (existingScore) {
      this.logger.log(
        `Submission ${submissionId} already scored, returning existing score`,
      );
      return existingScore;
    }

    // Calculate scores
    const scoringResult = await this.calculateScores(
      submissionWithQuestion,
      jobRequirements,
    );

    // Save to database
    const aiScore = await this.prisma.aIScore.create({
      data: {
        submissionId,
        totalScore: scoringResult.totalScore,
        breakdown: scoringResult.breakdown as unknown as Prisma.InputJsonValue,
        codeAnnotations:
          scoringResult.codeAnnotations as unknown as Prisma.InputJsonValue,
        suggestedQuestions: scoringResult.suggestedQuestions,
        behaviorSummary:
          scoringResult.behaviorSummary as unknown as Prisma.InputJsonValue,
      },
    });

    this.logger.log(
      `Scoring completed for submission ${submissionId}, total score: ${scoringResult.totalScore}`,
    );
    return aiScore;
  }

  /**
   * Score all submissions for an exam
   */
  async scoreExam(examId: string): Promise<void> {
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
      throw new NotFoundException(`Exam with ID "${examId}" not found`);
    }

    // Score each submission
    for (const submission of exam.submissions) {
      try {
        await this.scoreSubmission(submission.id);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Failed to score submission ${submission.id}: ${errorMessage}`,
        );
        // Continue with other submissions even if one fails
      }
    }

    // Update exam status to SCORED
    await this.prisma.exam.update({
      where: { id: examId },
      data: { status: ExamStatus.SCORED },
    });

    this.logger.log(`Scoring completed for exam ${examId}`);
  }

  /**
   * Get scoring result for a submission
   */
  async getScore(submissionId: string): Promise<AIScore | null> {
    return this.prisma.aIScore.findUnique({
      where: { submissionId },
    });
  }

  /**
   * Get all scores for an exam
   */
  async getExamScores(examId: string): Promise<AIScore[]> {
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

  /**
   * Retry scoring for a submission (admin only)
   */
  async retryScore(submissionId: string): Promise<AIScore> {
    // Delete existing score if any
    await this.prisma.aIScore.deleteMany({
      where: { submissionId },
    });

    // Re-score
    return this.scoreSubmission(submissionId);
  }

  /**
   * Calculate all dimension scores (新6维度)
   */
  private async calculateScores(
    submission: SubmissionWithQuestion,
    jobRequirements?: JobRequirements,
  ): Promise<ScoringResult> {
    const testResults =
      (submission.testResults as unknown as TestResult[]) || [];
    const code = submission.code;
    const question = submission.question;
    const codingEvents = submission.codingEvents;

    // Use LLM if available, otherwise use mock
    const useLLM = this.llmService.isAvailable();
    this.logger.log(
      `Using ${useLLM ? 'LLM' : 'Mock'} scoring for submission ${submission.id}`,
    );

    // 维度1: 最终交付质量 (25分) - 基于测试结果 + LLM边界评估
    const deliveryQuality = await this.evaluateDeliveryQuality(
      testResults,
      code,
      question,
      useLLM,
    );

    // 维度2: 代码工程质量 (15分)
    const codeQuality = await this.evaluateCodeQuality(code, question, useLLM);

    // 维度3: 问题解决过程 (20分) - 分析 codingEvents
    const problemSolving = await this.evaluateProblemSolving(
      code,
      question,
      codingEvents,
      useLLM,
    );

    // 维度4: 工具使用能力 (15分) [新增] - 分析 codingEvents
    const toolUsage = this.evaluateToolUsage(codingEvents);

    // 维度5: 工程化思维 (15分)
    const engineering = await this.evaluateEngineering(code, useLLM);

    // 维度6: 技术匹配度 (10分) [新增]
    const techMatch = await this.evaluateTechMatch(
      code,
      useLLM,
      jobRequirements,
    );

    const breakdown: ScoringBreakdown = {
      deliveryQuality,
      codeQuality,
      problemSolving,
      toolUsage,
      engineering,
      techMatch,
    };

    // 计算总分 (满分100)
    const totalScore = Math.round(
      deliveryQuality.score +
        codeQuality.score +
        problemSolving.score +
        toolUsage.score +
        engineering.score +
        techMatch.score,
    );

    // Generate report (questions and annotations)
    const scores = {
      deliveryQuality: deliveryQuality.score,
      codeQuality: codeQuality.score,
      problemSolving: problemSolving.score,
      toolUsage: toolUsage.score,
      engineering: engineering.score,
      techMatch: techMatch.score,
    };

    const report = await this.generateReport(code, scores, useLLM);

    // Calculate behavior summary from coding events
    const behaviorSummary = this.calculateBehaviorSummary(codingEvents);

    return {
      totalScore,
      breakdown,
      codeAnnotations: report.codeAnnotations,
      suggestedQuestions: report.suggestedQuestions,
      behaviorSummary,
    };
  }

  /**
   * 维度1: 最终交付质量 (25分)
   * - 测试通过率: 20分
   * - 边界处理: 5分 (LLM评估)
   */
  private async evaluateDeliveryQuality(
    testResults: TestResult[],
    code: string,
    question: QuestionData,
    useLLM: boolean,
  ): Promise<DeliveryQualityDimension> {
    const totalTests = testResults.length || 0;
    const passedTests = testResults.filter((t) => t.passed).length;
    const passRate = totalTests > 0 ? passedTests / totalTests : 0;

    // 测试通过率得分 (满分20分)
    const testScore = Math.round(passRate * 20 * 10) / 10;

    // 边界处理得分 (满分5分) - 使用LLM或Mock
    let edgeCaseScore = 0;
    let highlights: string[] = [];
    let issues: string[] = [];
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
        const result = this.llmService.extractJSONFromResponse<LLMEvaluationResponse>(response);
        edgeCaseScore = Math.min(5, Math.max(0, result.score || 0));
        highlights = result.highlights || [];
        issues = result.issues || [];
        analysis = result.analysis || '';
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `LLM edge case evaluation failed, falling back to mock: ${errorMessage}`,
        );
        const mockResult = this.mockScoringService.evaluateEdgeCaseHandling(
          code,
          testResults,
        );
        edgeCaseScore = Math.min(5, mockResult.score || 0);
        highlights = mockResult.highlights || [];
        issues = mockResult.issues || [];
        analysis = mockResult.analysis || '';
      }
    } else {
      const mockResult = this.mockScoringService.evaluateEdgeCaseHandling(
        code,
        testResults,
      );
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

  /**
   * 维度2: 代码工程质量 (15分)
   * - 可读性: 5分
   * - 命名规范: 5分
   * - 代码结构: 5分
   */
  private async evaluateCodeQuality(
    code: string,
    question: QuestionData,
    useLLM: boolean,
  ): Promise<CodeQualityDimension> {
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
      const result = this.llmService.extractJSONFromResponse<LLMEvaluationResponse>(response);
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `LLM code quality evaluation failed, falling back to mock: ${errorMessage}`,
      );
      return this.mockScoringService.evaluateCodeQualityNew(code);
    }
  }

  /**
   * 维度3: 问题解决过程 (20分)
   * - 思路条理性: 7分
   * - 调试策略: 7分
   * - 迭代改进: 6分
   */
  private async evaluateProblemSolving(
    code: string,
    question: QuestionData,
    codingEvents: Prisma.JsonValue | null,
    useLLM: boolean,
  ): Promise<ProblemSolvingDimension> {
    // 分析 codingEvents 数据
    const events = (codingEvents as unknown as CodingEvent[]) || [];
    const eventAnalysis = this.analyzeCodingEvents(events);

    if (!useLLM) {
      return this.mockScoringService.evaluateProblemSolvingNew(
        code,
        eventAnalysis,
      );
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
      const result = this.llmService.extractJSONFromResponse<LLMEvaluationResponse>(response);
      return {
        score: Math.min(20, Math.max(0, result.score || 0)),
        maxScore: 20,
        thinkingClarity: Math.min(7, Math.max(0, result.thinkingClarity || 0)),
        debugStrategy: Math.min(7, Math.max(0, result.debugStrategy || 0)),
        iterativeImprovement: Math.min(
          6,
          Math.max(0, result.iterativeImprovement || 0),
        ),
        analysis: result.analysis || '',
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `LLM problem solving evaluation failed, falling back to mock: ${errorMessage}`,
      );
      return this.mockScoringService.evaluateProblemSolvingNew(
        code,
        eventAnalysis,
      );
    }
  }

  /**
   * 维度4: 工具使用能力 (15分) [新增]
   * 分析粘贴模式、Tab切换、编码节奏
   */
  private evaluateToolUsage(
    codingEvents: Prisma.JsonValue | null,
  ): ToolUsageDimension {
    const events = (codingEvents as unknown as CodingEvent[]) || [];

    // 统计粘贴事件
    const pasteEvents = events.filter((e) => e.type === 'paste');
    const pasteCount = pasteEvents.length;

    // 统计 Tab 切换
    const tabSwitches = events.filter((e) => e.type === 'tab_away');
    const tabReturns = events.filter((e) => e.type === 'tab_return');
    const tabSwitchCount = tabSwitches.length;

    // 计算平均离开时间
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
    const avgTabAwayDuration =
      tabAwayCount > 0 ? Math.round(totalTabAwayDuration / tabAwayCount) : 0;

    // 分析粘贴模式
    let blindPasteCount = 0;
    let efficientPasteCount = 0;
    for (let i = 0; i < events.length; i++) {
      if (events[i].type === 'paste') {
        const pasteContent = events[i].data?.content || '';
        const pasteLength = pasteContent.length;

        // 检查粘贴后是否有修改
        let hasModification = false;
        const pasteTime = new Date(events[i].timestamp).getTime();
        for (let j = i + 1; j < events.length; j++) {
          const nextTime = new Date(events[j].timestamp).getTime();
          if (nextTime - pasteTime > 30000) break; // 30秒内
          if (events[j].type === 'keystroke' || events[j].type === 'code_change') {
            hasModification = true;
            break;
          }
        }

        if (pasteLength > 200 && !hasModification) {
          blindPasteCount++;
        } else if (pasteLength > 50 && hasModification) {
          efficientPasteCount++;
        }
      }
    }

    // 判断编码模式
    const runCodeCount = events.filter((e) => e.type === 'run_code').length;
    const keystrokeCount = events.filter((e) => e.type === 'keystroke').length;

    let codingPattern: 'think_first' | 'iterative' | 'research_driven' | 'paste_heavy';
    if (pasteCount > 5 && blindPasteCount > 2) {
      codingPattern = 'paste_heavy';
    } else if (tabSwitchCount > 3 && efficientPasteCount > 1) {
      codingPattern = 'research_driven';
    } else if (runCodeCount > 5) {
      codingPattern = 'iterative';
    } else {
      codingPattern = 'think_first';
    }

    // 评估工具使用效率
    let toolEfficiency: 'high' | 'medium' | 'low';
    let score = 0;
    let assessment = '';

    if (codingPattern === 'research_driven' && efficientPasteCount >= blindPasteCount) {
      toolEfficiency = 'high';
      score = 12 + Math.random() * 3; // 12-15
      assessment = '候选人善于利用外部资源，能够高效地查阅资料并应用到代码中。';
    } else if (codingPattern === 'think_first' && pasteCount <= 2) {
      toolEfficiency = 'high';
      score = 11 + Math.random() * 3; // 11-14
      assessment = '候选人倾向于先思考再编码，较少依赖外部资源，代码质量稳定。';
    } else if (codingPattern === 'iterative' && runCodeCount > 3) {
      toolEfficiency = 'medium';
      score = 9 + Math.random() * 3; // 9-12
      assessment = '候选人采用迭代式开发，频繁测试验证，但工具使用效率有提升空间。';
    } else if (codingPattern === 'paste_heavy') {
      toolEfficiency = 'low';
      score = 3 + Math.random() * 5; // 3-8
      assessment = '检测到大量粘贴行为，部分代码可能未经理解直接使用，建议关注代码理解深度。';
    } else {
      toolEfficiency = 'medium';
      score = 8 + Math.random() * 4; // 8-12
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

  /**
   * 维度5: 工程化思维 (15分)
   * - 错误处理: 5分
   * - 性能考量: 5分
   * - 模块化: 5分
   */
  private async evaluateEngineering(
    code: string,
    useLLM: boolean,
  ): Promise<EngineeringDimension> {
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
      const result = this.llmService.extractJSONFromResponse<LLMEvaluationResponse>(response);
      return {
        score: Math.min(15, Math.max(0, result.score || 0)),
        maxScore: 15,
        errorHandling: Math.min(5, Math.max(0, result.errorHandling || 0)),
        performance: Math.min(5, Math.max(0, result.performance || 0)),
        modularity: Math.min(5, Math.max(0, result.modularity || 0)),
        analysis: result.analysis || '',
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `LLM engineering evaluation failed, falling back to mock: ${errorMessage}`,
      );
      return this.mockScoringService.evaluateEngineeringNew(code);
    }
  }

  /**
   * 维度6: 技术匹配度 (10分) [新增]
   * 评估候选人代码中使用的技术是否匹配岗位要求
   */
  private async evaluateTechMatch(
    code: string,
    useLLM: boolean,
    jobRequirements?: JobRequirements,
  ): Promise<TechMatchDimension> {
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
      const result = this.llmService.extractJSONFromResponse<LLMEvaluationResponse>(response);
      return {
        score: Math.min(10, Math.max(0, result.score || 0)),
        maxScore: 10,
        matchedSkills: result.matchedSkills || [],
        missingSkills: result.missingSkills || [],
        analysis: result.analysis || '',
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `LLM tech match evaluation failed, falling back to mock: ${errorMessage}`,
      );
      return this.mockScoringService.evaluateTechMatch(code, jobRequirements);
    }
  }

  /**
   * Analyze coding events for problem solving evaluation
   */
  private analyzeCodingEvents(events: CodingEvent[]): {
    runCodeCount: number;
    codeChangeCount: number;
    thinkingPauses: number;
    debugTimeRatio: number;
    codingTimeRatio: number;
    totalDuration: number;
  } {
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

    // Calculate thinking pauses (idle time > 10 seconds)
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
      } else if (events[i].type === 'code_change' || events[i].type === 'keystroke') {
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

  /**
   * Generate report with suggested questions and code annotations
   */
  private async generateReport(
    code: string,
    scores: Record<string, number>,
    useLLM: boolean,
  ): Promise<{
    suggestedQuestions: string[];
    codeAnnotations: CodeAnnotation[];
  }> {
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
      return this.llmService.extractJSONFromResponse<{
        suggestedQuestions: string[];
        codeAnnotations: CodeAnnotation[];
      }>(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `LLM report generation failed, falling back to mock: ${errorMessage}`,
      );
      return this.mockScoringService.generateReportNew(code, scores);
    }
  }

  /**
   * Calculate behavior summary from coding events
   */
  private calculateBehaviorSummary(codingEvents: Prisma.JsonValue | null):
    | {
        codingSpeed?: number;
        debugAttempts?: number;
        timeDistribution?: Record<string, number>;
        toolUsageStats?: {
          pasteEvents: number;
          tabSwitches: number;
          avgTabAwayDuration: string;
          codingPattern: string;
        };
      }
    | undefined {
    if (!codingEvents) {
      return undefined;
    }

    const events = codingEvents as unknown as CodingEvent[];
    if (!Array.isArray(events) || events.length === 0) {
      return undefined;
    }

    // Calculate coding speed (characters per minute)
    const codeEvents = events.filter((e) => e.type === 'code_change');
    let codingSpeed = 0;
    if (codeEvents.length >= 2) {
      const firstEvent = new Date(codeEvents[0].timestamp);
      const lastEvent = new Date(codeEvents[codeEvents.length - 1].timestamp);
      const durationMinutes =
        (lastEvent.getTime() - firstEvent.getTime()) / 60000;

      if (durationMinutes > 0) {
        const totalChars = codeEvents.reduce(
          (sum, e) => sum + (e.data?.codeLength || 0),
          0,
        );
        codingSpeed = Math.round(totalChars / durationMinutes);
      }
    }

    // Tool usage stats
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
    const avgTabAwayDuration =
      tabAwayCount > 0 ? `${Math.round(totalTabAwayDuration / tabAwayCount)}s` : '0s';

    // Determine coding pattern
    const runCodeCount = events.filter((e) => e.type === 'run_code').length;
    let codingPattern = 'unknown';
    if (pasteEvents > 5) {
      codingPattern = 'paste_heavy';
    } else if (tabSwitches > 3) {
      codingPattern = 'research_driven';
    } else if (runCodeCount > 5) {
      codingPattern = 'iterative';
    } else {
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

  /**
   * Calculate time distribution across different activities
   */
  private calculateTimeDistribution(
    events: Array<{ type: string; timestamp: string }>,
  ): Record<string, number> {
    const distribution: Record<string, number> = {
      coding: 0,
      debugging: 0,
      idle: 0,
    };

    for (let i = 0; i < events.length - 1; i++) {
      const current = new Date(events[i].timestamp);
      const next = new Date(events[i + 1].timestamp);
      const duration = (next.getTime() - current.getTime()) / 1000; // seconds

      if (duration > 60) {
        distribution.idle += duration;
      } else if (events[i].type === 'run_code') {
        distribution.debugging += duration;
      } else {
        distribution.coding += duration;
      }
    }

    return distribution;
  }
}
