import { ConfigService } from '@nestjs/config';
import { ProviderInfo, LLMEvaluationResponse, LLMReportResponse, ResumeParsedData } from './types';
export type { LlmProviderConfig, ProviderInfo } from './types';
export type { LLMEvaluationResponse, LLMReportResponse, ResumeParsedData, } from './types';
export declare class LLMService {
    private readonly configService;
    private readonly logger;
    private providers;
    private defaultProviderId;
    constructor(configService: ConfigService);
    private loadProvidersFromEnv;
    getAvailableProviders(): ProviderInfo[];
    setDefaultProvider(providerId: string): void;
    isAvailable(): boolean;
    private getDefaultProvider;
    chat(prompt: string, options?: {
        providerId?: string;
        temperature?: number;
        maxTokens?: number;
        systemPrompt?: string;
    }): Promise<string>;
    private callOpenAICompatible;
    private callAnthropic;
    private callGoogle;
    evaluateCode(prompt: string): Promise<string>;
    parseResume(resumeText: string): Promise<ResumeParsedData>;
    private mockParseResume;
    extractJSONFromResponse<T = LLMEvaluationResponse | LLMReportResponse>(response: string): T;
    testProvider(providerId: string): Promise<{
        success: boolean;
        response?: string;
        error?: string;
    }>;
}
