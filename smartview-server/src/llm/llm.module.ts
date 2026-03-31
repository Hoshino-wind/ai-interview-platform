import { Global, Module } from '@nestjs/common';
import { LLMService } from './llm.service';
import { LlmController } from './llm.controller';

@Global()
@Module({
  controllers: [LlmController],
  providers: [LLMService],
  exports: [LLMService],
})
export class LlmModule {}
