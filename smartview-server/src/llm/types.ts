export interface LlmProviderConfig {
  id: string; // 唯一标识：'openai', 'claude', 'deepseek', 'glm', 'minimax', 'kimi', 'gemini', 'custom'
  name: string; // 显示名称
  apiType: 'openai' | 'anthropic' | 'google'; // API 协议类型
  baseUrl: string; // API Base URL
  apiKey: string; // API Key
  model: string; // 使用的模型名称
  enabled: boolean; // 是否启用
  isDefault: boolean; // 是否为默认提供商
  maxTokens?: number;
  temperature?: number;
}

// 预定义的提供商模板
export const PROVIDER_TEMPLATES: Record<
  string,
  Omit<Partial<LlmProviderConfig>, 'apiKey' | 'enabled' | 'isDefault'>
> = {
  openai: {
    name: 'OpenAI (GPT)',
    apiType: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  claude: {
    name: 'Claude',
    apiType: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    model: 'claude-3-5-sonnet-20241022',
  },
  gemini: {
    name: 'Gemini',
    apiType: 'google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-pro',
  },
  deepseek: {
    name: 'DeepSeek',
    apiType: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  },
  glm: {
    name: 'GLM (智谱)',
    apiType: 'openai',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
  },
  minimax: {
    name: 'MiniMax',
    apiType: 'openai',
    baseUrl: 'https://api.minimax.chat/v1',
    model: 'abab6.5s-chat',
  },
  kimi: {
    name: 'Kimi (月之暗面)',
    apiType: 'openai',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
  },
};

// 提供商信息（不包含敏感信息）
export interface ProviderInfo {
  id: string;
  name: string;
  model: string;
  isDefault: boolean;
  enabled: boolean;
}

// 切换默认提供商请求
export interface SetDefaultProviderDto {
  providerId: string;
}

// 测试连接结果
export interface TestProviderResult {
  success: boolean;
  response?: string;
  error?: string;
}

// 导出原有接口（保持向后兼容）
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
  codeAnnotations: Array<{
    line: number;
    type: 'highlight' | 'issue';
    comment: string;
  }>;
}

export interface ResumeParsedData {
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    years: number;
    techStack: string[];
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    major: string;
    year: number;
  }>;
  projects: Array<{
    name: string;
    description: string;
    techStack: string[];
  }>;
  yearsOfExperience: number;
  seniorityLevel: 'junior' | 'mid' | 'mid-senior' | 'senior' | 'expert';
}
