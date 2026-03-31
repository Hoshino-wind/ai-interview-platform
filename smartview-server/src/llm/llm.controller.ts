import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { LLMService } from './llm.service';
import type { SetDefaultProviderDto } from './types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/llm')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class LlmController {
  constructor(private readonly llmService: LLMService) {}

  // 获取所有可用模型提供商
  @Get('providers')
  getProviders() {
    return this.llmService.getAvailableProviders();
  }

  // 切换默认提供商
  @Put('providers/default')
  setDefaultProvider(@Body() body: SetDefaultProviderDto) {
    this.llmService.setDefaultProvider(body.providerId);
    return { success: true, defaultProvider: body.providerId };
  }

  // 测试提供商连接
  @Post('providers/test')
  async testProvider(@Body() body: { providerId: string }) {
    return this.llmService.testProvider(body.providerId);
  }
}
