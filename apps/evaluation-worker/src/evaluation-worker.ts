import Bull = require('bull');
import { DataSource } from 'typeorm';
import { EvaluationJobStatus, SessionStatus } from '@ai-interview/shared-types';
import { workerConfig } from './config';
import { EvaluationJob } from './entities/evaluation-job.entity';
import { EvaluationResult } from './entities/evaluation-result.entity';
import { InterviewSession } from './entities/interview-session.entity';
import { Submission } from './entities/submission.entity';
import { generateId } from './utils/generate-id';
import { SandboxClient } from './sandbox-client';

interface EvaluationQueuePayload {
  jobId: string;
  sessionId: string;
  submissionId: string;
}

export class EvaluationWorkerApp {
  private readonly queue = new Bull<EvaluationQueuePayload>(workerConfig.queueName, {
    redis: workerConfig.redis,
  });
  private readonly sandboxClient = new SandboxClient(workerConfig.sandboxRunnerUrl);

  constructor(private readonly dataSource: DataSource) {}

  async start(): Promise<void> {
    await this.dataSource.initialize();
    await this.queue.isReady();
    this.queue.process('evaluate', async (job: Bull.Job<EvaluationQueuePayload>) => {
      await this.handleEvaluation(job.data);
    });

    this.queue.on('completed', (job: Bull.Job<EvaluationQueuePayload>) => {
      console.log(`[evaluation-worker] completed job ${job.id}`);
    });

    this.queue.on('failed', (job: Bull.Job<EvaluationQueuePayload>, error: Error) => {
      console.error(`[evaluation-worker] failed job ${job?.id}: ${error.message}`);
    });
  }

  async stop(): Promise<void> {
    await this.queue.close();

    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  private async handleEvaluation(payload: EvaluationQueuePayload): Promise<void> {
    const evaluationJobRepository = this.dataSource.getRepository(EvaluationJob);
    const evaluationResultRepository = this.dataSource.getRepository(EvaluationResult);
    const sessionRepository = this.dataSource.getRepository(InterviewSession);
    const submissionRepository = this.dataSource.getRepository(Submission);

    const evaluationJob = await evaluationJobRepository.findOne({ where: { id: payload.jobId } });

    if (!evaluationJob) {
      throw new Error(`Evaluation job ${payload.jobId} not found`);
    }

    const submission = await submissionRepository.findOne({ where: { id: payload.submissionId } });

    if (!submission) {
      throw new Error(`Submission ${payload.submissionId} not found`);
    }

    try {
      evaluationJob.status = EvaluationJobStatus.RUNNING;
      evaluationJob.failureReason = undefined;
      await evaluationJobRepository.save(evaluationJob);

      const sandboxResult = await this.sandboxClient.execute({
        submissionId: submission.id,
        questionId: submission.questionId,
        contentType: submission.contentType,
        contentRef: submission.contentRef,
        language: submission.language,
        evaluationConfig: submission.evaluationConfig,
      });

      const autoScore = sandboxResult.totalCases === 0
        ? 0
        : Math.round((sandboxResult.passedCases / sandboxResult.totalCases) * 100);

      const result = evaluationResultRepository.create({
        id: generateId('evr'),
        sessionId: payload.sessionId,
        submissionId: payload.submissionId,
        evaluationJobId: payload.jobId,
        autoScore,
        gatePass: !sandboxResult.hasCriticalFailure && sandboxResult.hiddenCasesPassed,
        metrics: {
          totalCases: sandboxResult.totalCases,
          passedCases: sandboxResult.passedCases,
          executionTimeMs: sandboxResult.executionTimeMs,
          memoryUsedMb: sandboxResult.memoryUsedMb,
          stdout: sandboxResult.stdout,
          stderr: sandboxResult.stderr,
        },
        gateFlags: {
          hasCriticalFailure: sandboxResult.hasCriticalFailure,
          hiddenCasesPassed: sandboxResult.hiddenCasesPassed,
        },
      });

      evaluationJob.status = EvaluationJobStatus.COMPLETED;
      await evaluationJobRepository.save(evaluationJob);
      await evaluationResultRepository.save(result);

      const session = await sessionRepository.findOne({ where: { id: payload.sessionId } });

      if (session) {
        session.status = SessionStatus.REVIEWING;
        session.endedAt = session.endedAt ?? new Date();
        await sessionRepository.save(session);
      }
    } catch (error) {
      evaluationJob.status = EvaluationJobStatus.FAILED;
      evaluationJob.retryCount += 1;
      evaluationJob.failureReason = error instanceof Error ? error.message : 'Unknown evaluation failure';
      await evaluationJobRepository.save(evaluationJob);

      const session = await sessionRepository.findOne({ where: { id: payload.sessionId } });

      if (session) {
        session.status = SessionStatus.EVALUATION_FAILED;
        await sessionRepository.save(session);
      }

      throw error;
    }
  }
}
