import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';
import { SandboxModule } from './sandbox/sandbox.module';
import { ExamsModule } from './exams/exams.module';
import { ScoringModule } from './scoring/scoring.module';
import { InterviewsModule } from './interviews/interviews.module';
import { ApplicationsModule } from './applications/applications.module';
import { LlmModule } from './llm/llm.module';
import { ResumesModule } from './resumes/resumes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    LlmModule,
    AuthModule,
    UsersModule,
    QuestionsModule,
    SandboxModule,
    ExamsModule,
    ScoringModule,
    InterviewsModule,
    ApplicationsModule,
    ResumesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
