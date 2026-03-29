import { ConfigService } from '@nestjs/config';
import { LLMEvaluationResponse, LLMReportResponse } from '../dto/scoring-result.dto';
export declare class LLMService {
    private readonly configService;
    private readonly logger;
    private readonly provider;
    private readonly apiKey;
    private readonly model;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    private getDefaultModel;
    private getApiUrl;
    isAvailable(): boolean;
    evaluateCode(prompt: string): Promise<string>;
    private callOpenAICompatibleAPI;
    private callClaudeAPI;
    extractJSONFromResponse<T = LLMEvaluationResponse | LLMReportResponse>(response: string): T;
}
