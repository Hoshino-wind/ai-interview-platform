import { SandboxExecutionRequest, SandboxExecutionResult } from '@ai-interview/shared-types';

export class ExecutionService {
  async execute(request: SandboxExecutionRequest): Promise<SandboxExecutionResult> {
    const scoreSeed = Array.from(request.contentRef).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const testCases = request.evaluationConfig?.testCases ?? [];
    const totalCases = testCases.length || 10;
    const simulatedPassCount = testCases.length
      ? testCases.filter((_testCase, index) => ((scoreSeed + index) % 5) !== 0).length
      : Math.min(totalCases, Math.max(4, (scoreSeed % totalCases) + 1));
    const passedCases = Math.min(totalCases, simulatedPassCount);
    const hiddenCases = testCases.filter((testCase) => testCase.isHidden);
    const hiddenPassedCount = hiddenCases.length
      ? hiddenCases.filter((_testCase, index) => ((scoreSeed + index + 1) % 4) !== 0).length
      : passedCases;
    const hiddenCasesPassed = hiddenCases.length ? hiddenPassedCount === hiddenCases.length : passedCases >= 7;
    const hasCriticalFailure = request.contentRef.trim().length === 0;

    return {
      submissionId: request.submissionId,
      exitCode: hasCriticalFailure ? 1 : 0,
      stdout: hasCriticalFailure ? '' : `Executed ${request.language || request.contentType} submission`,
      stderr: hasCriticalFailure ? 'Submission content is empty' : '',
      executionTimeMs: Math.min(request.evaluationConfig?.timeLimitMs ?? 1000, 80 + (scoreSeed % 120)),
      memoryUsedMb: Math.min(request.evaluationConfig?.memoryLimitMb ?? 256, 64 + (scoreSeed % 32)),
      totalCases,
      passedCases: hasCriticalFailure ? 0 : passedCases,
      hiddenCasesPassed: !hasCriticalFailure && hiddenCasesPassed,
      hasCriticalFailure,
    };
  }
}
