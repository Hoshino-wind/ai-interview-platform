import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationService } from './evaluation.service';
import { EvaluationJob } from './entities/evaluation-job.entity';
import { EvaluationResult } from './entities/evaluation-result.entity';
import { InterviewSession } from '../session/entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluationJob, EvaluationResult, InterviewSession]),
    BullModule.registerQueue({
      name: 'evaluation',
    }),
  ],
  providers: [EvaluationService],
  exports: [EvaluationService],
})
export class EvaluationModule {}
