import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LLMService } from './llm/llm.service';
import { MockScoringService } from './llm/mock-scoring.service';
import {
  ScoringResult,
  ScoringBreakdown,
  LLMEvaluationResponse,
  CodeAnnotation,
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
  };
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

    // Load submission
    const submission = await this.prisma.examSubmission.findUnique({
      where: { id: submissionId },
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
      ...submission,
      question,
    };

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
    const scoringResult = await this.calculateScores(submissionWithQuestion);

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
   * Calculate all dimension scores
   */
  private async calculateScores(
    submission: SubmissionWithQuestion,
  ): Promise<ScoringResult> {
    const testResults =
      (submission.testResults as unknown as TestResult[]) || [];
    const code = submission.code;
    const question = submission.question;

    // Use LLM if available, otherwise use mock
    const useLLM = this.llmService.isAvailable();
    this.logger.log(
      `Using ${useLLM ? 'LLM' : 'Mock'} scoring for submission ${submission.id}`,
    );

    // Dimension 1: Correctness (10%) - calculated from test results
    const correctnessScore = this.calculateCorrectness(testResults);

    // Dimension 2-6: Use LLM or Mock
    const [
      codeQuality,
      edgeCaseHandling,
      complexity,
      engineering,
      problemSolving,
    ] = await Promise.all([
      this.evaluateCodeQuality(code, question, useLLM),
      this.evaluateEdgeCaseHandling(code, question, testResults, useLLM),
      this.evaluateComplexity(code, useLLM),
      this.evaluateEngineering(code, useLLM),
      this.evaluateProblemSolving(code, question, testResults, useLLM),
    ]);

    const breakdown: ScoringBreakdown = {
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

    // Calculate total score (max 60)
    const totalScore =
      Math.round(
        (breakdown.correctness.score +
          breakdown.codeQuality.score +
          breakdown.edgeCaseHandling.score +
          breakdown.complexity.score +
          breakdown.engineering.score +
          breakdown.problemSolving.score) *
          10,
      ) / 10;

    // Generate report (questions and annotations)
    const scores = {
      correctness: breakdown.correctness.score,
      codeQuality: breakdown.codeQuality.score,
      edgeCaseHandling: breakdown.edgeCaseHandling.score,
      complexity: breakdown.complexity.score,
      engineering: breakdown.engineering.score,
      problemSolving: breakdown.problemSolving.score,
    };

    const report = await this.generateReport(code, scores, useLLM);

    // Calculate behavior summary from coding events
    const behaviorSummary = this.calculateBehaviorSummary(
      submission.codingEvents,
    );

    return {
      totalScore,
      breakdown,
      codeAnnotations: report.codeAnnotations,
      suggestedQuestions: report.suggestedQuestions,
      behaviorSummary,
    };
  }

  /**
   * Calculate correctness score from test results
   */
  private calculateCorrectness(testResults: TestResult[]): number {
    if (!testResults || testResults.length === 0) {
      return 0;
    }
    const passedTests = testResults.filter((t) => t.passed).length;
    const passRate = passedTests / testResults.length;
    return Math.round(passRate * 10 * 10) / 10;
  }

  /**
   * Evaluate code quality
   */
  private async evaluateCodeQuality(
    code: string,
    question: QuestionData,
    useLLM: boolean,
  ): Promise<LLMEvaluationResponse> {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `LLM code quality evaluation failed, falling back to mock: ${errorMessage}`,
      );
      return this.mockScoringService.evaluateCodeQuality(code);
    }
  }

  /**
   * Evaluate edge case handling
   */
  private async evaluateEdgeCaseHandling(
    code: string,
    question: QuestionData,
    testResults: TestResult[],
    useLLM: boolean,
  ): Promise<LLMEvaluationResponse> {
    if (!useLLM) {
      return this.mockScoringService.evaluateEdgeCaseHandling(
        code,
        testResults,
      );
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `LLM edge case evaluation failed, falling back to mock: ${errorMessage}`,
      );
      return this.mockScoringService.evaluateEdgeCaseHandling(
        code,
        testResults,
      );
    }
  }

  /**
   * Evaluate complexity
   */
  private async evaluateComplexity(
    code: string,
    useLLM: boolean,
  ): Promise<LLMEvaluationResponse> {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `LLM complexity evaluation failed, falling back to mock: ${errorMessage}`,
      );
      return this.mockScoringService.evaluateComplexity(code);
    }
  }

  /**
   * Evaluate engineering practices
   */
  private async evaluateEngineering(
    code: string,
    useLLM: boolean,
  ): Promise<LLMEvaluationResponse> {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `LLM engineering evaluation failed, falling back to mock: ${errorMessage}`,
      );
      return this.mockScoringService.evaluateEngineering(code);
    }
  }

  /**
   * Evaluate problem solving ability
   */
  private async evaluateProblemSolving(
    code: string,
    question: QuestionData,
    testResults: TestResult[],
    useLLM: boolean,
  ): Promise<LLMEvaluationResponse> {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `LLM problem solving evaluation failed, falling back to mock: ${errorMessage}`,
      );
      return this.mockScoringService.evaluateProblemSolving(code, testResults);
    }
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
      return this.llmService.extractJSONFromResponse<{
        suggestedQuestions: string[];
        codeAnnotations: CodeAnnotation[];
      }>(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `LLM report generation failed, falling back to mock: ${errorMessage}`,
      );
      return this.mockScoringService.generateReport(code, scores);
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
