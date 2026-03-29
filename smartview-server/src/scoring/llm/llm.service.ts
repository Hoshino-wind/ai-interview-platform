import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LLMEvaluationResponse,
  LLMReportResponse,
} from '../dto/scoring-result.dto';

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private readonly provider: string;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.configService.get<string>('LLM_PROVIDER') || '';
    this.apiKey = this.configService.get<string>('LLM_API_KEY') || '';
    this.model =
      this.configService.get<string>('LLM_MODEL') || this.getDefaultModel();
    this.apiUrl = this.getApiUrl();
  }

  private getDefaultModel(): string {
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

  private getApiUrl(): string {
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

  isAvailable(): boolean {
    return !!this.apiKey && !!this.provider;
  }

  async evaluateCode(prompt: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('LLM service is not configured');
    }

    try {
      if (this.provider.toLowerCase() === 'claude') {
        return this.callClaudeAPI(prompt);
      } else {
        return this.callOpenAICompatibleAPI(prompt);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`LLM API call failed: ${errorMessage}`);
      throw err;
    }
  }

  private async callOpenAICompatibleAPI(prompt: string): Promise<string> {
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
            content:
              'You are a code evaluation expert. Always respond with valid JSON format.',
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

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content || '';
  }

  private async callClaudeAPI(prompt: string): Promise<string> {
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

    const data = (await response.json()) as {
      content?: Array<{ text?: string }>;
    };
    return data.content?.[0]?.text || '';
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
}
