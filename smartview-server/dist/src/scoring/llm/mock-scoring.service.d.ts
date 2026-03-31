import { LLMEvaluationResponse, LLMReportResponse, CodeQualityDimension, ProblemSolvingDimension, EngineeringDimension, TechMatchDimension } from '../dto/scoring-result.dto';
interface TestResult {
    passed: boolean;
    input?: string;
    expectedOutput?: string;
    actualOutput?: string;
    error?: string;
}
interface JobRequirements {
    title: string;
    description: string;
    requirements: string;
    tags: string[];
}
interface CodingEventAnalysis {
    runCodeCount: number;
    codeChangeCount: number;
    thinkingPauses: number;
    debugTimeRatio: number;
    codingTimeRatio: number;
    totalDuration: number;
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
    evaluateCodeQualityNew(code: string): CodeQualityDimension;
    evaluateProblemSolvingNew(code: string, eventAnalysis: CodingEventAnalysis): ProblemSolvingDimension;
    evaluateEngineeringNew(code: string): EngineeringDimension;
    evaluateTechMatch(code: string, jobRequirements: JobRequirements): TechMatchDimension;
    generateReportNew(code: string, scores: Record<string, number>): LLMReportResponse;
}
export {};
