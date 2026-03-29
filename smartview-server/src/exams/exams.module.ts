import { Module, forwardRef } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { SandboxModule } from '../sandbox/sandbox.module';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [SandboxModule, forwardRef(() => ScoringModule)],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
