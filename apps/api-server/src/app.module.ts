import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './modules/auth/auth.module';
import { QuestionModule } from './modules/question/question.module';
import { SessionModule } from './modules/session/session.module';
import { SubmissionModule } from './modules/submission/submission.module';
import { EvaluationModule } from './modules/evaluation/evaluation.module';

const isDevelopment = process.env.NODE_ENV === 'development';
const shouldSynchronize = process.env.DB_SYNCHRONIZE === 'true';
const shouldRunMigrations = process.env.DB_RUN_MIGRATIONS === 'true';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库连接
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'ai_interview',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      synchronize: shouldSynchronize,
      migrationsRun: shouldRunMigrations,
      logging: isDevelopment,
    }),

    // Redis 队列
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),

    // 业务模块
    AuthModule,
    QuestionModule,
    SessionModule,
    SubmissionModule,
    EvaluationModule,
  ],
})
export class AppModule {}
