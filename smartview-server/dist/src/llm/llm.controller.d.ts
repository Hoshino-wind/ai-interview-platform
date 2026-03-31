import { LLMService } from './llm.service';
import type { SetDefaultProviderDto } from './types';
export declare class LlmController {
    private readonly llmService;
    constructor(llmService: LLMService);
    getProviders(): import("./types").ProviderInfo[];
    setDefaultProvider(body: SetDefaultProviderDto): {
        success: boolean;
        defaultProvider: string;
    };
    testProvider(body: {
        providerId: string;
    }): Promise<{
        success: boolean;
        response?: string;
        error?: string;
    }>;
}
