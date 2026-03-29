import { SandboxService, RunCodeResult } from './sandbox.service';
import { RunCodeDto } from './dto/run-code.dto';
export declare class SandboxController {
    private readonly sandboxService;
    constructor(sandboxService: SandboxService);
    runCode(runCodeDto: RunCodeDto): Promise<{
        success: boolean;
        data: RunCodeResult;
    }>;
}
