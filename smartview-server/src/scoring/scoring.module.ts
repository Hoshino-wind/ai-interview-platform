import { Module } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { ScoringController } from './scoring.controller';
import { LLMService } from './llm/llm.service';
import { MockScoringService } from './llm/mock-scoring.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScoringController],
  providers: [ScoringService, LLMService, MockScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}
