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
const types_1 = require("./types");
let LLMService = LLMService_1 = class LLMService {
    configService;
    logger = new common_1.Logger(LLMService_1.name);
    providers = new Map();
    defaultProviderId = null;
    constructor(configService) {
        this.configService = configService;
        this.loadProvidersFromEnv();
    }
    loadProvidersFromEnv() {
        const providersStr = this.configService.get('LLM_PROVIDERS');
        if (providersStr) {
            const providerIds = providersStr
                .split(',')
                .map((s) => s.trim().toLowerCase())
                .filter((s) => s);
            for (const id of providerIds) {
                const template = types_1.PROVIDER_TEMPLATES[id];
                if (template || id === 'custom') {
                    const upperKey = id.toUpperCase();
                    const apiKey = this.configService.get(`LLM_${upperKey}_API_KEY`);
                    if (apiKey) {
                        const config = {
                            id,
                            name: this.configService.get(`LLM_${upperKey}_NAME`) ||
                                template?.name ||
                                id,
                            apiType: template?.apiType || 'openai',
                            baseUrl: this.configService.get(`LLM_${upperKey}_BASE_URL`) ||
                                template?.baseUrl ||
                                '',
                            apiKey,
                            model: this.configService.get(`LLM_${upperKey}_MODEL`) ||
                                template?.model ||
                                '',
                            enabled: true,
                            isDefault: false,
                            maxTokens: this.configService.get(`LLM_${upperKey}_MAX_TOKENS`),
                            temperature: this.configService.get(`LLM_${upperKey}_TEMPERATURE`),
                        };
                        this.providers.set(id, config);
                    }
                }
            }
            const defaultId = this.configService.get('LLM_DEFAULT_PROVIDER')?.toLowerCase() ||
                providerIds[0];
            if (this.providers.has(defaultId)) {
                this.defaultProviderId = defaultId;
                this.providers.get(defaultId).isDefault = true;
            }
        }
        else {
            const provider = this.configService.get('LLM_PROVIDER')?.toLowerCase() || '';
            const apiKey = this.configService.get('LLM_API_KEY') || '';
            if (apiKey && provider) {
                const template = types_1.PROVIDER_TEMPLATES[provider];
                const config = {
                    id: provider,
                    name: template?.name || provider,
                    apiType: template?.apiType || 'openai',
                    baseUrl: this.configService.get('LLM_BASE_URL') ||
                        template?.baseUrl ||
                        '',
                    apiKey,
                    model: this.configService.get('LLM_MODEL') || template?.model || '',
                    enabled: true,
                    isDefault: true,
                };
                this.providers.set(provider, config);
                this.defaultProviderId = provider;
            }
        }
        if (this.providers.size > 0) {
            const providerNames = Array.from(this.providers.values())
                .map((p) => `${p.name}(${p.model})`)
                .join(', ');
            this.logger.log(`Loaded ${this.providers.size} LLM provider(s): ${providerNames}. Default: ${this.defaultProviderId || 'none'}`);
        }
        else {
            this.logger.warn('No LLM providers configured. LLM features will be limited.');
        }
    }
    getAvailableProviders() {
        return Array.from(this.providers.values()).map((p) => ({
            id: p.id,
            name: p.name,
            model: p.model,
            isDefault: p.isDefault,
            enabled: p.enabled,
        }));
    }
    setDefaultProvider(providerId) {
        const normalizedId = providerId.toLowerCase();
        if (!this.providers.has(normalizedId)) {
            throw new Error(`Provider ${providerId} not found`);
        }
        for (const [id, config] of this.providers) {
            config.isDefault = id === normalizedId;
        }
        this.defaultProviderId = normalizedId;
        this.logger.log(`Default provider changed to: ${normalizedId}`);
    }
    isAvailable() {
        return this.providers.size > 0 && this.defaultProviderId !== null;
    }
    getDefaultProvider() {
        if (!this.defaultProviderId)
            return null;
        return this.providers.get(this.defaultProviderId) || null;
    }
    async chat(prompt, options) {
        const providerId = options?.providerId?.toLowerCase() || this.defaultProviderId;
        if (!providerId || !this.providers.has(providerId)) {
            throw new Error('No LLM provider available');
        }
        const config = this.providers.get(providerId);
        switch (config.apiType) {
            case 'openai':
                return this.callOpenAICompatible(config, prompt, options);
            case 'anthropic':
                return this.callAnthropic(config, prompt, options);
            case 'google':
                return this.callGoogle(config, prompt, options);
            default:
                return this.callOpenAICompatible(config, prompt, options);
        }
    }
    async callOpenAICompatible(config, prompt, options) {
        const url = `${config.baseUrl}/chat/completions`;
        const systemPrompt = options?.systemPrompt ||
            'You are a professional assistant. Always respond with valid JSON format only, no additional text.';
        this.logger.debug(`Calling OpenAI-compatible API: ${config.name} at ${url}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt },
                ],
                temperature: options?.temperature ?? config.temperature ?? 0.1,
                max_tokens: options?.maxTokens ?? config.maxTokens ?? 4000,
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`LLM API error (${config.name}): ${response.status} - ${error}`);
        }
        const data = (await response.json());
        return data.choices?.[0]?.message?.content || '';
    }
    async callAnthropic(config, prompt, options) {
        const url = `${config.baseUrl}/v1/messages`;
        const systemPrompt = options?.systemPrompt ||
            'You are a professional assistant. Always respond with valid JSON format only, no additional text.';
        this.logger.debug(`Calling Anthropic API: ${config.name} at ${url}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: config.model,
                max_tokens: options?.maxTokens ?? config.maxTokens ?? 4000,
                system: systemPrompt,
                messages: [{ role: 'user', content: prompt }],
                temperature: options?.temperature ?? config.temperature ?? 0.1,
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Claude API error: ${response.status} - ${error}`);
        }
        const data = (await response.json());
        return data.content?.[0]?.text || '';
    }
    async callGoogle(config, prompt, options) {
        const url = `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`;
        const systemPrompt = options?.systemPrompt ||
            'You are a professional assistant. Always respond with valid JSON format only, no additional text.';
        this.logger.debug(`Calling Google API: ${config.name} at ${url}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
                generationConfig: {
                    temperature: options?.temperature ?? config.temperature ?? 0.1,
                    maxOutputTokens: options?.maxTokens ?? config.maxTokens ?? 4000,
                },
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${error}`);
        }
        const data = (await response.json());
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    async evaluateCode(prompt) {
        if (!this.isAvailable()) {
            throw new Error('LLM service is not configured');
        }
        try {
            return await this.chat(prompt);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.logger.error(`LLM API call failed: ${errorMessage}`);
            throw err;
        }
    }
    async parseResume(resumeText) {
        if (!this.isAvailable()) {
            return this.mockParseResume(resumeText);
        }
        const prompt = `请解析以下简历文本，提取结构化信息。返回 JSON 格式：
{
  "skills": ["技术栈1", "技术栈2", ...],
  "experience": [
    { "company": "公司名", "role": "职位", "years": 工作年限, "techStack": ["技术1"], "description": "工作描述" }
  ],
  "education": [
    { "school": "学校", "degree": "学位", "major": "专业", "year": 毕业年份 }
  ],
  "projects": [
    { "name": "项目名", "description": "项目描述", "techStack": ["技术1"] }
  ],
  "yearsOfExperience": 总工作年限,
  "seniorityLevel": "junior" | "mid" | "mid-senior" | "senior" | "expert"
}

简历文本：
${resumeText}`;
        try {
            const response = await this.chat(prompt);
            return this.extractJSONFromResponse(response);
        }
        catch (error) {
            this.logger.warn('Failed to parse resume with LLM, using mock parser');
            return this.mockParseResume(resumeText);
        }
    }
    mockParseResume(resumeText) {
        const techKeywords = [
            'JavaScript',
            'TypeScript',
            'Python',
            'Java',
            'Go',
            'Rust',
            'C++',
            'C#',
            'React',
            'Vue',
            'Angular',
            'Node.js',
            'Express',
            'Next.js',
            'NestJS',
            'PostgreSQL',
            'MySQL',
            'MongoDB',
            'Redis',
            'Elasticsearch',
            'Docker',
            'Kubernetes',
            'AWS',
            'Azure',
            'GCP',
            'Git',
            'CI/CD',
            'Jenkins',
            'GitLab',
            'GraphQL',
            'REST',
            'gRPC',
            'WebSocket',
            'Tailwind',
            'CSS',
            'HTML',
            'Sass',
            'Redux',
            'MobX',
            'Zustand',
            'Jest',
            'Cypress',
            'Playwright',
            'Webpack',
            'Vite',
            'Babel',
            'Linux',
            'Shell',
            'Bash',
            'Machine Learning',
            'AI',
            'Deep Learning',
            'TensorFlow',
            'PyTorch',
        ];
        const foundSkills = [];
        const lowerText = resumeText.toLowerCase();
        techKeywords.forEach((keyword) => {
            if (lowerText.includes(keyword.toLowerCase())) {
                foundSkills.push(keyword);
            }
        });
        const yearMatches = resumeText.match(/(\d+)\s*年.*经验|(\d+)\s*years?\s*(?:of)?\s*experience/i);
        const yearsOfExperience = yearMatches
            ? parseInt(yearMatches[1] || yearMatches[2], 10)
            : Math.min(10, Math.floor(foundSkills.length / 3));
        let seniorityLevel = 'junior';
        if (yearsOfExperience >= 8) {
            seniorityLevel = 'expert';
        }
        else if (yearsOfExperience >= 5) {
            seniorityLevel = 'senior';
        }
        else if (yearsOfExperience >= 3) {
            seniorityLevel = 'mid-senior';
        }
        else if (yearsOfExperience >= 1) {
            seniorityLevel = 'mid';
        }
        return {
            skills: foundSkills.length > 0 ? foundSkills : ['未识别到技术栈'],
            experience: [],
            education: [],
            projects: [],
            yearsOfExperience,
            seniorityLevel,
        };
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
    async testProvider(providerId) {
        const normalizedId = providerId.toLowerCase();
        if (!this.providers.has(normalizedId)) {
            return { success: false, error: `Provider ${providerId} not found` };
        }
        try {
            const response = await this.chat('请回复"连接成功"', {
                providerId: normalizedId,
                maxTokens: 50,
            });
            return { success: true, response: response.substring(0, 100) };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return { success: false, error: errorMessage };
        }
    }
};
exports.LLMService = LLMService;
exports.LLMService = LLMService = LLMService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LLMService);
//# sourceMappingURL=llm.service.js.map