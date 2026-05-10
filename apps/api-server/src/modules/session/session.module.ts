import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { InterviewSession } from './entities/session.entity';
import { Submission } from '../submission/entities/submission.entity';
import { EvaluationJob } from '../evaluation/entities/evaluation-job.entity';
import { EvaluationResult } from '../evaluation/entities/evaluation-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InterviewSession, Submission, EvaluationJob, EvaluationResult])],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
