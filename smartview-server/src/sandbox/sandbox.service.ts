import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { RunCodeDto } from './dto/run-code.dto';

export interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}

export interface RunCodeResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  executionTime: number;
  testResults?: TestResult[];
}

@Injectable()
export class SandboxService {
  private readonly logger = new Logger(SandboxService.name);
  private readonly tempDir = '/tmp/smartview-sandbox';
  private readonly timeoutMs = 30000; // 30 seconds
  private readonly maxBuffer = 10 * 1024 * 1024; // 10MB

  constructor() {
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async runCode(dto: RunCodeDto): Promise<RunCodeResult> {
    const { code, language, testCases } = dto;

    // Create temp file for code
    const fileExtension = this.getFileExtension(language);
    const tempFileName = `code_${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension}`;
    const tempFilePath = path.join(this.tempDir, tempFileName);

    try {
      // Write code to temp file
      fs.writeFileSync(tempFilePath, code);

      if (testCases && testCases.length > 0) {
        // Run with test cases
        return await this.runWithTestCases(tempFilePath, language, testCases);
      } else {
        // Run without test cases
        return await this.executeCode(tempFilePath, language);
      }
    } finally {
      // Clean up temp file
      this.cleanupTempFile(tempFilePath);
    }
  }

  private async runWithTestCases(
    filePath: string,
    language: string,
    testCases: { input: string; expectedOutput: string }[],
  ): Promise<RunCodeResult> {
    const testResults: TestResult[] = [];
    let combinedStdout = '';
    let combinedStderr = '';
    let totalExecutionTime = 0;
    let hasTimeout = false;
    let lastExitCode = 0;

    for (const testCase of testCases) {
      const result = await this.executeCodeWithInput(
        filePath,
        language,
        testCase.input,
      );

      combinedStdout += result.stdout;
      combinedStderr += result.stderr;
      totalExecutionTime += result.executionTime;

      if (result.timedOut) {
        hasTimeout = true;
      }
      if (result.exitCode !== 0) {
        lastExitCode = result.exitCode;
      }

      const actualOutput = result.stdout.trim();
      const passed = actualOutput === testCase.expectedOutput.trim();

      testResults.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput,
        passed,
      });
    }

    return {
      stdout: combinedStdout,
      stderr: combinedStderr,
      exitCode: lastExitCode,
      timedOut: hasTimeout,
      executionTime: totalExecutionTime,
      testResults,
    };
  }

  private async executeCode(
    filePath: string,
    language: string,
  ): Promise<RunCodeResult> {
    return this.executeCodeWithInput(filePath, language, '');
  }

  private async executeCodeWithInput(
    filePath: string,
    language: string,
    input: string,
  ): Promise<Omit<RunCodeResult, 'testResults'>> {
    const command = this.getCommand(language);
    const args = this.getCommandArgs(language, filePath);

    return new Promise((resolve) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const child = spawn(command, args, {
        cwd: this.tempDir,
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=512' },
      });

      // Set up timeout
      const timeout = setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');

        // Force kill after 5 seconds if still running
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL');
          }
        }, 5000);
      }, this.timeoutMs);

      // Handle stdout
      child.stdout.on('data', (data: Buffer) => {
        const chunk = data.toString();
        if (stdout.length + chunk.length <= this.maxBuffer) {
          stdout += chunk;
        } else {
          stdout += chunk.substring(0, this.maxBuffer - stdout.length);
        }
      });

      // Handle stderr
      child.stderr.on('data', (data: Buffer) => {
        const chunk = data.toString();
        if (stderr.length + chunk.length <= this.maxBuffer) {
          stderr += chunk;
        } else {
          stderr += chunk.substring(0, this.maxBuffer - stderr.length);
        }
      });

      // Handle process completion
      child.on('close', (exitCode) => {
        clearTimeout(timeout);
        const executionTime = Date.now() - startTime;

        resolve({
          stdout,
          stderr,
          exitCode: exitCode ?? 1,
          timedOut,
          executionTime,
        });
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        const executionTime = Date.now() - startTime;

        resolve({
          stdout,
          stderr: stderr + `\nProcess error: ${error.message}`,
          exitCode: 1,
          timedOut,
          executionTime,
        });
      });

      // Send input to stdin if provided
      if (input) {
        child.stdin.write(input);
      }
      child.stdin.end();
    });
  }

  private getFileExtension(language: string): string {
    switch (language) {
      case 'javascript':
        return '.js';
      case 'typescript':
        return '.ts';
      case 'python':
        return '.py';
      default:
        return '.txt';
    }
  }

  private getCommand(language: string): string {
    switch (language) {
      case 'javascript':
      case 'typescript':
        return 'node';
      case 'python':
        return 'python3';
      default:
        return 'node';
    }
  }

  private getCommandArgs(language: string, filePath: string): string[] {
    // For TypeScript, we treat it as JavaScript for MVP (or could use tsx if available)
    return [filePath];
  }

  private cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup temp file: ${filePath}`, error);
    }
  }
}
