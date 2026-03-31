// ==================== 新6维度评分结构 ====================

// 维度1: 最终交付质量 (25分)
export interface DeliveryQualityDimension {
  score: number;
  maxScore: number;
  testPassRate: string; // e.g., "17/20"
  edgeCases: number; // 边界处理得分 0-5
  highlights?: string[];
  issues?: string[];
  analysis?: string;
}

// 维度2: 代码工程质量 (15分)
export interface CodeQualityDimension {
  score: number;
  maxScore: number;
  readability: number; // 0-5
  naming: number; // 0-5
  structure: number; // 0-5
  highlights?: string[];
  issues?: string[];
  analysis?: string;
}

// 维度3: 问题解决过程 (20分)
export interface ProblemSolvingDimension {
  score: number;
  maxScore: number;
  thinkingClarity: number; // 0-7
  debugStrategy: number; // 0-7
  iterativeImprovement: number; // 0-6
  analysis?: string;
}

// 维度4: 工具使用能力 (15分) [新增]
export interface ToolUsageDimension {
  score: number;
  maxScore: number;
  pasteEvents: number;
  tabSwitches: number;
  avgTabAwayDuration: string; // e.g., "45s"
  codingPattern: 'think_first' | 'iterative' | 'research_driven' | 'paste_heavy';
  toolEfficiency: 'high' | 'medium' | 'low';
  assessment: string;
}

// 维度5: 工程化思维 (15分)
export interface EngineeringDimension {
  score: number;
  maxScore: number;
  errorHandling: number; // 0-5
  performance: number; // 0-5
  modularity: number; // 0-5
  analysis?: string;
}

// 维度6: 技术匹配度 (10分) [新增]
export interface TechMatchDimension {
  score: number;
  maxScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  analysis?: string;
}

// 新的评分拆解结构
export interface ScoringBreakdown {
  deliveryQuality: DeliveryQualityDimension;
  codeQuality: CodeQualityDimension;
  problemSolving: ProblemSolvingDimension;
  toolUsage: ToolUsageDimension;
  engineering: EngineeringDimension;
  techMatch: TechMatchDimension;
}

// 保留旧类型用于兼容
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

// LLM 评估响应类型（新6维度）
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
  // 新维度字段
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
