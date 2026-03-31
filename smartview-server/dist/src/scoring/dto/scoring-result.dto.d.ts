export interface DeliveryQualityDimension {
    score: number;
    maxScore: number;
    testPassRate: string;
    edgeCases: number;
    highlights?: string[];
    issues?: string[];
    analysis?: string;
}
export interface CodeQualityDimension {
    score: number;
    maxScore: number;
    readability: number;
    naming: number;
    structure: number;
    highlights?: string[];
    issues?: string[];
    analysis?: string;
}
export interface ProblemSolvingDimension {
    score: number;
    maxScore: number;
    thinkingClarity: number;
    debugStrategy: number;
    iterativeImprovement: number;
    analysis?: string;
}
export interface ToolUsageDimension {
    score: number;
    maxScore: number;
    pasteEvents: number;
    tabSwitches: number;
    avgTabAwayDuration: string;
    codingPattern: 'think_first' | 'iterative' | 'research_driven' | 'paste_heavy';
    toolEfficiency: 'high' | 'medium' | 'low';
    assessment: string;
}
export interface EngineeringDimension {
    score: number;
    maxScore: number;
    errorHandling: number;
    performance: number;
    modularity: number;
    analysis?: string;
}
export interface TechMatchDimension {
    score: number;
    maxScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    analysis?: string;
}
export interface ScoringBreakdown {
    deliveryQuality: DeliveryQualityDimension;
    codeQuality: CodeQualityDimension;
    problemSolving: ProblemSolvingDimension;
    toolUsage: ToolUsageDimension;
    engineering: EngineeringDimension;
    techMatch: TechMatchDimension;
}
export interface ScoringDimension {
    score: number;
    maxScore: number;
    highlights?: string[];
    issues?: string[];
    analysis?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    projectStructure?: number;
    modularity?: number;
    maintainability?: number;
    testing?: number;
    problemDecomposition?: number;
    debugging?: number;
    multiApproach?: number;
}
export interface CodeAnnotation {
    line: number;
    type: 'highlight' | 'issue';
    comment: string;
}
export interface ScoringResult {
    totalScore: number;
    breakdown: ScoringBreakdown;
    codeAnnotations: CodeAnnotation[];
    suggestedQuestions: string[];
    behaviorSummary?: {
        codingSpeed?: number;
        debugAttempts?: number;
        timeDistribution?: Record<string, number>;
    };
}
export interface LLMEvaluationResponse {
    score: number;
    highlights?: string[];
    issues?: string[];
    analysis?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    projectStructure?: number;
    modularity?: number;
    maintainability?: number;
    testing?: number;
    problemDecomposition?: number;
    debugging?: number;
    multiApproach?: number;
    readability?: number;
    naming?: number;
    structure?: number;
    thinkingClarity?: number;
    debugStrategy?: number;
    iterativeImprovement?: number;
    errorHandling?: number;
    performance?: number;
    matchedSkills?: string[];
    missingSkills?: string[];
    edgeCases?: number;
}
export interface LLMReportResponse {
    suggestedQuestions: string[];
    codeAnnotations: CodeAnnotation[];
}
