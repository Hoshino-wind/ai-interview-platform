export interface LlmProviderConfig {
    id: string;
    name: string;
    apiType: 'openai' | 'anthropic' | 'google';
    baseUrl: string;
    apiKey: string;
    model: string;
    enabled: boolean;
    isDefault: boolean;
    maxTokens?: number;
    temperature?: number;
}
export declare const PROVIDER_TEMPLATES: Record<string, Omit<Partial<LlmProviderConfig>, 'apiKey' | 'enabled' | 'isDefault'>>;
export interface ProviderInfo {
    id: string;
    name: string;
    model: string;
    isDefault: boolean;
    enabled: boolean;
}
export interface SetDefaultProviderDto {
    providerId: string;
}
export interface TestProviderResult {
    success: boolean;
    response?: string;
    error?: string;
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
