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
export declare class SandboxService {
    private readonly logger;
    private readonly tempDir;
    private readonly timeoutMs;
    private readonly maxBuffer;
    constructor();
    runCode(dto: RunCodeDto): Promise<RunCodeResult>;
    private runWithTestCases;
    private executeCode;
    private executeCodeWithInput;
    private getFileExtension;
    private getCommand;
    private getCommandArgs;
    private cleanupTempFile;
}
