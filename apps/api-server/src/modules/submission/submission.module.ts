import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { Submission } from './entities/submission.entity';
import { InterviewSession } from '../session/entities/session.entity';
import { EvaluationModule } from '../evaluation/evaluation.module';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, InterviewSession]), EvaluationModule],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
