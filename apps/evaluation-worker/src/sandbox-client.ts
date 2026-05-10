import { SandboxExecutionRequest, SandboxExecutionResult } from '@ai-interview/shared-types';

export class SandboxClient {
  constructor(private readonly baseUrl: string) {}

  async execute(request: SandboxExecutionRequest): Promise<SandboxExecutionResult> {
    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Sandbox runner request failed with status ${response.status}`);
    }

    return (await response.json()) as SandboxExecutionResult;
  }
}
