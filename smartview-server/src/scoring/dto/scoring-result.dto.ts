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

export interface ScoringBreakdown {
  correctness: ScoringDimension;
  codeQuality: ScoringDimension;
  edgeCaseHandling: ScoringDimension;
  complexity: ScoringDimension;
  engineering: ScoringDimension;
  problemSolving: ScoringDimension;
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
}

export interface LLMReportResponse {
  suggestedQuestions: string[];
  codeAnnotations: CodeAnnotation[];
}
