import { Module } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { ScoringController } from './scoring.controller';
import { MockScoringService } from './llm/mock-scoring.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [PrismaModule, LlmModule],
  controllers: [ScoringController],
  providers: [ScoringService, MockScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}
