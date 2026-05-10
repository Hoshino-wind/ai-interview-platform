import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { workerConfig } from './config';
import { InterviewSession } from './entities/interview-session.entity';
import { EvaluationJob } from './entities/evaluation-job.entity';
import { EvaluationResult } from './entities/evaluation-result.entity';
import { Submission } from './entities/submission.entity';

export const evaluationWorkerDataSource = new DataSource({
  type: 'postgres',
  host: workerConfig.postgres.host,
  port: workerConfig.postgres.port,
  username: workerConfig.postgres.username,
  password: workerConfig.postgres.password,
  database: workerConfig.postgres.database,
  entities: [InterviewSession, EvaluationJob, EvaluationResult, Submission],
  synchronize: false,
});
