import { LLMEvaluationResponse, LLMReportResponse } from '../dto/scoring-result.dto';
interface TestResult {
    passed: boolean;
    input?: string;
    expectedOutput?: string;
    actualOutput?: string;
    error?: string;
}
export declare class MockScoringService {
    private readonly logger;
    calculateCorrectness(testResults: TestResult[]): {
        score: number;
        maxScore: number;
    };
    evaluateCodeQuality(code: string): LLMEvaluationResponse;
    evaluateEdgeCaseHandling(code: string, testResults: TestResult[]): LLMEvaluationResponse;
    evaluateComplexity(code: string): LLMEvaluationResponse;
    evaluateEngineering(code: string): LLMEvaluationResponse;
    evaluateProblemSolving(code: string, testResults: TestResult[]): LLMEvaluationResponse;
    generateReport(code: string, scores: Record<string, number>): LLMReportResponse;
}
export {};
