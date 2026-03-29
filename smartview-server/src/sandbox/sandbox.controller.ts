import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SandboxService, RunCodeResult } from './sandbox.service';
import { RunCodeDto } from './dto/run-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/sandbox')
@UseGuards(JwtAuthGuard)
export class SandboxController {
  constructor(private readonly sandboxService: SandboxService) {}

  @Post('run')
  async runCode(
    @Body() runCodeDto: RunCodeDto,
  ): Promise<{ success: boolean; data: RunCodeResult }> {
    const result = await this.sandboxService.runCode(runCodeDto);
    return {
      success: true,
      data: result,
    };
  }
}
