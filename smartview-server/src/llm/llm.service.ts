import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LlmProviderConfig,
  PROVIDER_TEMPLATES,
  ProviderInfo,
  LLMEvaluationResponse,
  LLMReportResponse,
  ResumeParsedData,
} from './types';

export type { LlmProviderConfig, ProviderInfo } from './types';
export type {
  LLMEvaluationResponse,
  LLMReportResponse,
  ResumeParsedData,
} from './types';

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private providers: Map<string, LlmProviderConfig> = new Map();
  private defaultProviderId: string | null = null;

  constructor(private readonly configService: ConfigService) {
    this.loadProvidersFromEnv();
  }

  // 从环境变量加载提供商配置
  private loadProvidersFromEnv(): void {
    // 支持多种环境变量格式：
    // 方式 1：传统单一配置（向后兼容）
    // LLM_PROVIDER=deepseek
    // LLM_API_KEY=sk-xxx
    // LLM_MODEL=deepseek-chat
    // LLM_BASE_URL=https://api.deepseek.com/v1 (可选)

    // 方式 2：多提供商配置
    // LLM_PROVIDERS=deepseek,openai,glm
    // LLM_DEEPSEEK_API_KEY=sk-xxx
    // LLM_DEEPSEEK_MODEL=deepseek-chat (可选)
    // LLM_OPENAI_API_KEY=sk-xxx
    // LLM_OPENAI_MODEL=gpt-4o-mini (可选)
    // LLM_GLM_API_KEY=xxx
    // LLM_DEFAULT_PROVIDER=deepseek

    // 方式 3：自定义提供商
    // LLM_CUSTOM_NAME=MyProvider
    // LLM_CUSTOM_BASE_URL=https://my-llm.example.com/v1
    // LLM_CUSTOM_API_KEY=xxx
    // LLM_CUSTOM_MODEL=my-model

    const providersStr = this.configService.get<string>('LLM_PROVIDERS');

    if (providersStr) {
      // 多提供商模式
      const providerIds = providersStr
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s);

      for (const id of providerIds) {
        const template = PROVIDER_TEMPLATES[id];
        if (template || id === 'custom') {
          const upperKey = id.toUpperCase();
          const apiKey = this.configService.get<string>(`LLM_${upperKey}_API_KEY`);
          if (apiKey) {
            const config: LlmProviderConfig = {
              id,
              name:
                this.configService.get<string>(`LLM_${upperKey}_NAME`) ||
                template?.name ||
                id,
              apiType: template?.apiType || 'openai',
              baseUrl:
                this.configService.get<string>(`LLM_${upperKey}_BASE_URL`) ||
                template?.baseUrl ||
                '',
              apiKey,
              model:
                this.configService.get<string>(`LLM_${upperKey}_MODEL`) ||
                template?.model ||
                '',
              enabled: true,
              isDefault: false,
              maxTokens: this.configService.get<number>(`LLM_${upperKey}_MAX_TOKENS`),
              temperature: this.configService.get<number>(
                `LLM_${upperKey}_TEMPERATURE`,
              ),
            };
            this.providers.set(id, config);
          }
        }
      }

      const defaultId =
        this.configService.get<string>('LLM_DEFAULT_PROVIDER')?.toLowerCase() ||
        providerIds[0];
      if (this.providers.has(defaultId)) {
        this.defaultProviderId = defaultId;
        this.providers.get(defaultId)!.isDefault = true;
      }
    } else {
      // 传统单一提供商模式（向后兼容）
      const provider =
        this.configService.get<string>('LLM_PROVIDER')?.toLowerCase() || '';
      const apiKey = this.configService.get<string>('LLM_API_KEY') || '';

      if (apiKey && provider) {
        const template = PROVIDER_TEMPLATES[provider];
        const config: LlmProviderConfig = {
          id: provider,
          name: template?.name || provider,
          apiType: template?.apiType || 'openai',
          baseUrl:
            this.configService.get<string>('LLM_BASE_URL') ||
            template?.baseUrl ||
            '',
          apiKey,
          model:
            this.configService.get<string>('LLM_MODEL') || template?.model || '',
          enabled: true,
          isDefault: true,
        };
        this.providers.set(provider, config);
        this.defaultProviderId = provider;
      }
    }

    // Log loaded providers (without API keys)
    if (this.providers.size > 0) {
      const providerNames = Array.from(this.providers.values())
        .map((p) => `${p.name}(${p.model})`)
        .join(', ');
      this.logger.log(
        `Loaded ${this.providers.size} LLM provider(s): ${providerNames}. Default: ${this.defaultProviderId || 'none'}`,
      );
    } else {
      this.logger.warn('No LLM providers configured. LLM features will be limited.');
    }
  }

  // 获取所有可用提供商列表（不暴露 API Key）
  getAvailableProviders(): ProviderInfo[] {
    return Array.from(this.providers.values()).map((p) => ({
      id: p.id,
      name: p.name,
      model: p.model,
      isDefault: p.isDefault,
      enabled: p.enabled,
    }));
  }

  // 设置默认提供商（运行时切换）
  setDefaultProvider(providerId: string): void {
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

  // 是否有可用的 LLM 提供商
  isAvailable(): boolean {
    return this.providers.size > 0 && this.defaultProviderId !== null;
  }

  // 获取当前默认提供商配置
  private getDefaultProvider(): LlmProviderConfig | null {
    if (!this.defaultProviderId) return null;
    return this.providers.get(this.defaultProviderId) || null;
  }

  // 核心调用方法 - 支持指定 providerId
  async chat(
    prompt: string,
    options?: {
      providerId?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    },
  ): Promise<string> {
    const providerId = options?.providerId?.toLowerCase() || this.defaultProviderId;
    if (!providerId || !this.providers.has(providerId)) {
      throw new Error('No LLM provider available');
    }

    const config = this.providers.get(providerId)!;

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

  // OpenAI 兼容 API 调用（GPT, DeepSeek, GLM, MiniMax, Kimi, 自定义）
  private async callOpenAICompatible(
    config: LlmProviderConfig,
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    },
  ): Promise<string> {
    const url = `${config.baseUrl}/chat/completions`;
    const systemPrompt =
      options?.systemPrompt ||
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
      throw new Error(
        `LLM API error (${config.name}): ${response.status} - ${error}`,
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content || '';
  }

  // Anthropic (Claude) API 调用
  private async callAnthropic(
    config: LlmProviderConfig,
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    },
  ): Promise<string> {
    const url = `${config.baseUrl}/v1/messages`;
    const systemPrompt =
      options?.systemPrompt ||
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

    const data = (await response.json()) as {
      content?: Array<{ text?: string }>;
    };
    return data.content?.[0]?.text || '';
  }

  // Google (Gemini) API 调用
  private async callGoogle(
    config: LlmProviderConfig,
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    },
  ): Promise<string> {
    const url = `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`;
    const systemPrompt =
      options?.systemPrompt ||
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

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // 保持原有 public 方法签名不变 - 向后兼容
  async evaluateCode(prompt: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('LLM service is not configured');
    }

    try {
      return await this.chat(prompt);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`LLM API call failed: ${errorMessage}`);
      throw err;
    }
  }

  async parseResume(resumeText: string): Promise<ResumeParsedData> {
    if (!this.isAvailable()) {
      // Return mock data when LLM is not available
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
      return this.extractJSONFromResponse<ResumeParsedData>(response);
    } catch (error) {
      this.logger.warn('Failed to parse resume with LLM, using mock parser');
      return this.mockParseResume(resumeText);
    }
  }

  private mockParseResume(resumeText: string): ResumeParsedData {
    // Extract skills from common tech keywords
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

    const foundSkills: string[] = [];
    const lowerText = resumeText.toLowerCase();

    techKeywords.forEach((keyword) => {
      if (lowerText.includes(keyword.toLowerCase())) {
        foundSkills.push(keyword);
      }
    });

    // Estimate years of experience based on text patterns
    const yearMatches = resumeText.match(
      /(\d+)\s*年.*经验|(\d+)\s*years?\s*(?:of)?\s*experience/i,
    );
    const yearsOfExperience = yearMatches
      ? parseInt(yearMatches[1] || yearMatches[2], 10)
      : Math.min(10, Math.floor(foundSkills.length / 3));

    // Determine seniority level
    let seniorityLevel: 'junior' | 'mid' | 'mid-senior' | 'senior' | 'expert' =
      'junior';
    if (yearsOfExperience >= 8) {
      seniorityLevel = 'expert';
    } else if (yearsOfExperience >= 5) {
      seniorityLevel = 'senior';
    } else if (yearsOfExperience >= 3) {
      seniorityLevel = 'mid-senior';
    } else if (yearsOfExperience >= 1) {
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

  extractJSONFromResponse<T = LLMEvaluationResponse | LLMReportResponse>(
    response: string,
  ): T {
    // Try to extract JSON from markdown code blocks
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      response = codeBlockMatch[1].trim();
    }

    // Try to find JSON object in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      response = jsonMatch[0];
    }

    try {
      return JSON.parse(response) as T;
    } catch {
      this.logger.warn(
        `Failed to parse JSON from response: ${response.substring(0, 200)}...`,
      );
      throw new Error('Failed to parse LLM response as JSON');
    }
  }

  // 测试提供商连接
  async testProvider(providerId: string): Promise<{ success: boolean; response?: string; error?: string }> {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
    }
  }
}
