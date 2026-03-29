import { Injectable, Logger } from '@nestjs/common';
import {
  LLMEvaluationResponse,
  LLMReportResponse,
  CodeAnnotation,
} from '../dto/scoring-result.dto';

interface TestResult {
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string;
}

@Injectable()
export class MockScoringService {
  private readonly logger = new Logger(MockScoringService.name);

  calculateCorrectness(testResults: TestResult[]): {
    score: number;
    maxScore: number;
  } {
    if (!testResults || testResults.length === 0) {
      return { score: 0, maxScore: 10 };
    }
    const passedTests = testResults.filter((t) => t.passed).length;
    const passRate = passedTests / testResults.length;
    return { score: Math.round(passRate * 10 * 10) / 10, maxScore: 10 };
  }

  evaluateCodeQuality(code: string): LLMEvaluationResponse {
    const lines = code.split('\n').length;
    const functions = (
      code.match(/function\s+\w+|const\s+\w+\s*=\s*\(|\w+\s*:\s*function/g) ||
      []
    ).length;
    const comments = (code.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || []).length;

    // Base score between 3-5 based on code structure
    let score = 3 + Math.min(2, functions * 0.3 + comments * 0.1);
    score = Math.min(5, Math.max(3, score));

    const highlights: string[] = [];
    const issues: string[] = [];

    if (functions > 0) {
      highlights.push(`代码包含 ${functions} 个函数/方法，结构清晰`);
    }
    if (comments > 0) {
      highlights.push(`包含 ${comments} 处注释，有助于理解代码逻辑`);
    }
    if (lines > 50) {
      issues.push('代码较长，建议进一步模块化以提高可读性');
    }
    if (comments === 0) {
      issues.push('缺少注释，建议添加关键逻辑说明');
    }

    return {
      score: Math.round(score * 10) / 10,
      highlights,
      issues,
      analysis: `代码共 ${lines} 行，结构${functions > 0 ? '良好' : '简单'}，${comments > 0 ? '有注释说明' : '缺少注释'}。`,
    };
  }

  evaluateEdgeCaseHandling(
    code: string,
    testResults: TestResult[],
  ): LLMEvaluationResponse {
    const { score: correctnessScore } = this.calculateCorrectness(testResults);
    // Edge case score is based on correctness with a slight penalty
    const score = Math.min(5, correctnessScore * 0.5 * 0.8);

    const hasTryCatch = code.includes('try') && code.includes('catch');
    const hasValidation =
      code.includes('if') &&
      (code.includes('null') ||
        code.includes('undefined') ||
        code.includes('length'));

    const highlights: string[] = [];
    const issues: string[] = [];

    if (hasTryCatch) {
      highlights.push('使用了 try-catch 进行异常处理');
    }
    if (hasValidation) {
      highlights.push('包含输入验证逻辑');
    }
    if (!hasTryCatch) {
      issues.push('建议添加异常处理机制以提高代码健壮性');
    }
    if (!hasValidation) {
      issues.push('建议添加参数校验，防止无效输入');
    }

    return {
      score: Math.round(score * 10) / 10,
      highlights,
      issues,
      analysis: `边界处理能力${score > 3 ? '良好' : score > 2 ? '一般' : '需要改进'}，${hasTryCatch ? '有异常处理' : '缺少异常处理'}，${hasValidation ? '有输入验证' : '缺少输入验证'}。`,
    };
  }

  evaluateComplexity(code: string): LLMEvaluationResponse {
    const loops = (
      code.match(/for\s*\(|while\s*\(|forEach|map\s*\(|filter\s*\(/g) || []
    ).length;
    const recursion = code.includes(code.match(/function\s+(\w+)/)?.[1] || '');

    // Simple heuristic for complexity score
    let score = 3 + Math.random() * 1.5; // Random between 3-4.5
    if (loops > 2) score += 0.3;
    if (recursion) score += 0.2;
    score = Math.min(5, score);

    let timeComplexity = 'O(1)';
    let spaceComplexity = 'O(1)';

    if (loops === 1) {
      timeComplexity = 'O(n)';
    } else if (loops === 2) {
      timeComplexity = 'O(n²)';
    } else if (loops > 2) {
      timeComplexity = 'O(n^k)';
    }

    if (code.includes('Array') || code.includes('[]')) {
      spaceComplexity = 'O(n)';
    }

    return {
      score: Math.round(score * 10) / 10,
      timeComplexity,
      spaceComplexity,
      analysis: `代码包含 ${loops} 个循环结构，时间复杂度为 ${timeComplexity}，空间复杂度为 ${spaceComplexity}。`,
    };
  }

  evaluateEngineering(code: string): LLMEvaluationResponse {
    const lines = code.split('\n').length;
    const functions = (
      code.match(/function\s+\w+|const\s+\w+\s*=\s*\(|\w+\s*:\s*function/g) ||
      []
    ).length;
    const hasTests =
      code.includes('test') ||
      code.includes('describe') ||
      code.includes('it(');
    const hasModules =
      code.includes('import') ||
      code.includes('export') ||
      code.includes('require');
    const hasTypes =
      code.includes(': ') &&
      (code.includes('string') ||
        code.includes('number') ||
        code.includes('boolean'));

    // Base score calculation
    let score = 12 + Math.random() * 6; // Base 12-18
    if (functions > 3) score += 1;
    if (hasTests) score += 2;
    if (hasModules) score += 1;
    if (hasTypes) score += 1;
    score = Math.min(20, score);

    const projectStructure = Math.min(
      5,
      3 + (hasModules ? 1 : 0) + (functions > 3 ? 1 : 0),
    );
    const modularity = Math.min(
      5,
      3 + (functions > 0 ? 1 : 0) + (functions > 3 ? 1 : 0),
    );
    const maintainability = Math.min(
      5,
      3 + (hasTypes ? 1 : 0) + (lines < 50 ? 1 : 0),
    );
    const testing = hasTests ? 4 + Math.random() : Math.random() * 2;

    return {
      score: Math.round(score * 10) / 10,
      projectStructure: Math.round(projectStructure * 10) / 10,
      modularity: Math.round(modularity * 10) / 10,
      maintainability: Math.round(maintainability * 10) / 10,
      testing: Math.round(testing * 10) / 10,
      analysis: `工程化水平${score > 15 ? '良好' : score > 10 ? '一般' : '需要改进'}，${hasModules ? '模块化设计良好' : '建议改进模块化'}，${hasTests ? '包含测试代码' : '建议添加测试'}。`,
    };
  }

  evaluateProblemSolving(
    code: string,
    testResults: TestResult[],
  ): LLMEvaluationResponse {
    const { score: correctnessScore } = this.calculateCorrectness(testResults);
    // Problem solving score based on correctness with bonus for code structure
    const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || [])
      .length;
    let score = correctnessScore * 1.5 * 0.85;
    if (functions > 1) score += 1;
    score = Math.min(15, score);

    const problemDecomposition = Math.min(
      5,
      3 + (functions > 1 ? 1 : 0) + (functions > 3 ? 1 : 0),
    );
    const debugging =
      correctnessScore > 7 ? 4 + Math.random() : 2 + Math.random() * 2;
    const multiApproach =
      functions > 2 ? 3 + Math.random() * 2 : 2 + Math.random();

    return {
      score: Math.round(score * 10) / 10,
      problemDecomposition: Math.round(problemDecomposition * 10) / 10,
      debugging: Math.round(debugging * 10) / 10,
      multiApproach: Math.round(multiApproach * 10) / 10,
      analysis: `问题解决能力${score > 10 ? '优秀' : score > 7 ? '良好' : '需要提升'}，${functions > 1 ? '能够将问题分解为多个函数' : '建议进一步分解问题'}。`,
    };
  }

  generateReport(
    code: string,
    scores: Record<string, number>,
  ): LLMReportResponse {
    const lines = code.split('\n');
    const annotations: CodeAnnotation[] = [];
    const suggestedQuestions: string[] = [];

    // Generate code annotations
    // Find function definitions and add highlights
    lines.forEach((line, index) => {
      if (line.includes('function') || line.match(/const\s+\w+\s*=\s*\(/)) {
        annotations.push({
          line: index + 1,
          type: 'highlight',
          comment: '函数定义清晰',
        });
      }
      if (line.includes('// TODO') || line.includes('// FIXME')) {
        annotations.push({
          line: index + 1,
          type: 'issue',
          comment: '有待办事项需要处理',
        });
      }
    });

    // Limit annotations
    const limitedAnnotations = annotations.slice(0, 5);

    // Generate suggested questions based on scores
    const avgScore =
      Object.values(scores).reduce((a, b) => a + b, 0) /
      Object.values(scores).length;

    if (scores.engineering < 12) {
      suggestedQuestions.push(
        '请谈谈你对代码模块化设计的理解，以及如何改进这段代码的结构？',
      );
    }
    if (scores.edgeCaseHandling < 3) {
      suggestedQuestions.push('你在处理边界情况时是如何考虑的？能否举例说明？');
    }
    if (scores.complexity < 3) {
      suggestedQuestions.push(
        '请分析一下这段代码的时间复杂度和空间复杂度，是否有优化空间？',
      );
    }
    if (scores.problemSolving < 10) {
      suggestedQuestions.push(
        '在解决这个问题时，你是否考虑过其他方案？为什么选择当前方案？',
      );
    }
    if (avgScore > 12) {
      suggestedQuestions.push(
        '你的代码整体质量不错，请分享一下你的编码习惯和最佳实践？',
      );
    }

    // Ensure at least 3 questions
    const defaultQuestions = [
      '请介绍一下这段代码的核心逻辑和实现思路。',
      '如果需求变更，你会如何修改这段代码以适应新的要求？',
      '在编写这段代码时，你遇到的最大挑战是什么？如何解决的？',
    ];

    while (suggestedQuestions.length < 3) {
      suggestedQuestions.push(defaultQuestions[suggestedQuestions.length]);
    }

    return {
      suggestedQuestions: suggestedQuestions.slice(0, 5),
      codeAnnotations: limitedAnnotations,
    };
  }
}
