"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LLMService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let LLMService = LLMService_1 = class LLMService {
    configService;
    logger = new common_1.Logger(LLMService_1.name);
    provider;
    apiKey;
    model;
    apiUrl;
    constructor(configService) {
        this.configService = configService;
        this.provider = this.configService.get('LLM_PROVIDER') || '';
        this.apiKey = this.configService.get('LLM_API_KEY') || '';
        this.model =
            this.configService.get('LLM_MODEL') || this.getDefaultModel();
        this.apiUrl = this.getApiUrl();
    }
    getDefaultModel() {
        switch (this.provider.toLowerCase()) {
            case 'openai':
                return 'gpt-4';
            case 'deepseek':
                return 'deepseek-chat';
            case 'claude':
                return 'claude-3-sonnet-20240229';
            default:
                return 'gpt-4';
        }
    }
    getApiUrl() {
        switch (this.provider.toLowerCase()) {
            case 'openai':
                return 'https://api.openai.com/v1/chat/completions';
            case 'deepseek':
                return 'https://api.deepseek.com/v1/chat/completions';
            case 'claude':
                return 'https://api.anthropic.com/v1/messages';
            default:
                return 'https://api.openai.com/v1/chat/completions';
        }
    }
    isAvailable() {
        return !!this.apiKey && !!this.provider;
    }
    async evaluateCode(prompt) {
        if (!this.isAvailable()) {
            throw new Error('LLM service is not configured');
        }
        try {
            if (this.provider.toLowerCase() === 'claude') {
                return this.callClaudeAPI(prompt);
            }
            else {
                return this.callOpenAICompatibleAPI(prompt);
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.logger.error(`LLM API call failed: ${errorMessage}`);
            throw err;
        }
    }
    async callOpenAICompatibleAPI(prompt) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a code evaluation expert. Always respond with valid JSON format.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.1,
                max_tokens: 2000,
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`LLM API error: ${response.status} - ${errorText}`);
        }
        const data = (await response.json());
        return data.choices?.[0]?.message?.content || '';
    }
    async callClaudeAPI(prompt) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: 2000,
                temperature: 0.1,
                messages: [
                    {
                        role: 'user',
                        content: `You are a code evaluation expert. Always respond with valid JSON format.\n\n${prompt}`,
                    },
                ],
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Claude API error: ${response.status} - ${errorText}`);
        }
        const data = (await response.json());
        return data.content?.[0]?.text || '';
    }
    extractJSONFromResponse(response) {
        const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
            response = codeBlockMatch[1].trim();
        }
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            response = jsonMatch[0];
        }
        try {
            return JSON.parse(response);
        }
        catch {
            this.logger.warn(`Failed to parse JSON from response: ${response.substring(0, 200)}...`);
            throw new Error('Failed to parse LLM response as JSON');
        }
    }
};
exports.LLMService = LLMService;
exports.LLMService = LLMService = LLMService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LLMService);
//# sourceMappingURL=llm.service.js.map