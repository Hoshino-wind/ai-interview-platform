// 用户角色
export enum UserRole {
  CANDIDATE = 'candidate',
  INTERVIEWER = 'interviewer',
  HIRING_MANAGER = 'hiring_manager',
  HRBP = 'hrbp',
  CALIBRATION_OFFICER = 'calibration_officer',
  COMPLIANCE = 'compliance',
}

// 会话状态
export enum SessionStatus {
  DRAFT = 'draft',
  PENDING_CONSENT = 'pending_consent',
  IN_PROGRESS = 'in_progress',
  EVALUATING = 'evaluating',
  REVIEWING = 'reviewing',
  DECIDED = 'decided',
  ARCHIVED = 'archived',
  EVALUATION_FAILED = 'evaluation_failed',
  MANUAL_HOLD = 'manual_hold',
}

// 题目类型
export enum QuestionType {
  ANCHOR = 'anchor',
  CUSTOM = 'custom',
}

export enum QuestionParseStatus {
  NOT_STARTED = 'not_started',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// 提交内容类型
export enum ContentType {
  CODE = 'code',
  DESIGN = 'design',
  TEXT = 'text',
}

// 评测任务状态
export enum EvaluationJobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// AI 提示记录
export interface AIPromptUsed {
  prompt: string;
  timestamp: string;
}

export interface EvaluationTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  weight?: number;
}

export interface EvaluationConfig {
  runnerType: 'stub';
  testCases: EvaluationTestCase[];
  timeLimitMs?: number;
  memoryLimitMb?: number;
}

export interface QuestionParseResult {
  summary: string;
  extractedSections: string[];
  parserVersion: string;
  notes?: string;
}

export interface Question {
  id: string;
  title: string;
  type: QuestionType;
  stem: string;
  rawContent?: string;
  sourceFormat: 'markdown' | 'plain_text' | 'json';
  evaluationConfig?: EvaluationConfig;
  parseStatus: QuestionParseStatus;
  parseResult?: QuestionParseResult;
  parseRequestedAt?: Date;
  parsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 提交记录
export interface Submission {
  id: string;
  sessionId: string;
  questionId: string;
  versionNo: number;
  contentType: ContentType;
  contentRef: string;
  language?: string;
  thoughtProcess?: string;
  iterationReason?: string;
  aiPromptsUsed?: AIPromptUsed[];
  evaluationConfig?: EvaluationConfig;
  notes?: string;
  submittedAt: Date;
}

// 过程质量评估
export interface ProcessQuality {
  problemClarification: {
    score: number;
    evidence: string[];
    comment: string;
  };
  solutionTradeoffs: {
    score: number;
    evidence: string[];
    comment: string;
  };
  debuggingIteration: {
    score: number;
    evidence: string[];
    comment: string;
  };
  toolCollaboration: {
    score: number;
    evidence: string[];
    comment: string;
  };
}

// AI 评估项
export interface AIAssessmentItem {
  issue: string;
  evidence: string[];
  fix: string;
  impact: string;
  confidence: number;
}

// AI 评估结果
export interface AIAssessment {
  id: string;
  sessionId: string;
  questionId: string;
  modelProvider: string;
  modelName: string;
  modelVersion?: string;
  promptVersion: string;
  items: AIAssessmentItem[];
  overallConfidence: number;
  processQuality?: ProcessQuality;
  assessedAt: Date;
  processingTimeMs?: number;
}

// 评分结果
export interface ScoreResult {
  autoScore: number;
  aiScore: number;
  interviewerScore: number;
  finalScore: number;
  gatePass: boolean;
}

// 面试会话
export interface InterviewSession {
  id: string;
  candidateId: string;
  positionId: string;
  questionPackageId: string;
  status: SessionStatus;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 沙箱执行协议
export interface SandboxExecutionRequest {
  submissionId: string;
  questionId: string;
  contentType: ContentType;
  contentRef: string;
  language?: string;
  evaluationConfig?: EvaluationConfig;
}

export interface SandboxExecutionResult {
  submissionId: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  memoryUsedMb: number;
  totalCases: number;
  passedCases: number;
  hiddenCasesPassed: boolean;
  hasCriticalFailure: boolean;
}
