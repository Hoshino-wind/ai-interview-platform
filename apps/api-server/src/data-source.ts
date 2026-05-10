import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { InterviewSession } from './modules/session/entities/session.entity';
import { Question } from './modules/question/entities/question.entity';
import { Submission } from './modules/submission/entities/submission.entity';
import { EvaluationJob } from './modules/evaluation/entities/evaluation-job.entity';
import { EvaluationResult } from './modules/evaluation/entities/evaluation-result.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ai_interview',
  entities: [Question, InterviewSession, Submission, EvaluationJob, EvaluationResult],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});

export default AppDataSource;
