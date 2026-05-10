import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { EvaluationJobStatus, SessionStatus } from '@shared/shared-types';
import { generateId } from '../../common/utils/generate-id';
import { EvaluationJob } from './entities/evaluation-job.entity';
import { EvaluationResult } from './entities/evaluation-result.entity';
import { InterviewSession } from '../session/entities/session.entity';

interface CreateEvaluationJobInput {
  sessionId: string;
  submissionId: string;
  idempotencyKey?: string;
}

interface CompleteEvaluationJobInput {
  jobId: string;
  autoScore: number;
  gatePass: boolean;
  metrics: Record<string, unknown>;
  gateFlags?: Record<string, unknown>;
}

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(EvaluationJob)
    private evaluationJobRepository: Repository<EvaluationJob>,
    @InjectRepository(EvaluationResult)
    private evaluationResultRepository: Repository<EvaluationResult>,
    @InjectRepository(InterviewSession)
    private sessionRepository: Repository<InterviewSession>,
    @InjectQueue('evaluation')
    private evaluationQueue: Queue,
  ) {}

  async createJob(input: CreateEvaluationJobInput): Promise<EvaluationJob> {
    const existingJob = input.idempotencyKey
      ? await this.evaluationJobRepository.findOne({ where: { idempotencyKey: input.idempotencyKey } })
      : null;

    if (existingJob) {
      return existingJob;
    }

    const job = this.evaluationJobRepository.create({
      id: generateId('eval'),
      sessionId: input.sessionId,
      submissionId: input.submissionId,
      idempotencyKey: input.idempotencyKey,
      status: EvaluationJobStatus.PENDING,
      retryCount: 0,
    });

    const savedJob = await this.evaluationJobRepository.save(job);

    await this.evaluationQueue.add(
      'evaluate',
      { jobId: savedJob.id, sessionId: savedJob.sessionId, submissionId: savedJob.submissionId },
      { jobId: savedJob.id },
    );

    return savedJob;
  }

  async markJobRunning(jobId: string): Promise<EvaluationJob> {
    const job = await this.getJobOrThrow(jobId);
    job.status = EvaluationJobStatus.RUNNING;
    return this.evaluationJobRepository.save(job);
  }

  async completeJob(input: CompleteEvaluationJobInput): Promise<EvaluationResult> {
    const job = await this.getJobOrThrow(input.jobId);

    job.status = EvaluationJobStatus.COMPLETED;
    job.failureReason = undefined;
    await this.evaluationJobRepository.save(job);

    const result = this.evaluationResultRepository.create({
      id: generateId('evr'),
      sessionId: job.sessionId,
      submissionId: job.submissionId,
      evaluationJobId: job.id,
      autoScore: input.autoScore,
      gatePass: input.gatePass,
      metrics: input.metrics,
      gateFlags: input.gateFlags,
    });

    const session = await this.sessionRepository.findOne({ where: { id: job.sessionId } });

    if (session) {
      session.status = SessionStatus.REVIEWING;
      session.endedAt = session.endedAt ?? new Date();
      await this.sessionRepository.save(session);
    }

    return this.evaluationResultRepository.save(result);
  }

  async failJob(jobId: string, failureReason: string): Promise<EvaluationJob> {
    const job = await this.getJobOrThrow(jobId);
    job.status = EvaluationJobStatus.FAILED;
    job.retryCount += 1;
    job.failureReason = failureReason;
    await this.evaluationJobRepository.save(job);

    const session = await this.sessionRepository.findOne({ where: { id: job.sessionId } });

    if (session) {
      session.status = SessionStatus.EVALUATION_FAILED;
      await this.sessionRepository.save(session);
    }

    return job;
  }

  async getLatestResult(sessionId: string): Promise<EvaluationResult | null> {
    return this.evaluationResultRepository.findOne({
      where: { sessionId },
      order: { createdAt: 'DESC' },
    });
  }

  private async getJobOrThrow(jobId: string): Promise<EvaluationJob> {
    const job = await this.evaluationJobRepository.findOne({ where: { id: jobId } });

    if (!job) {
      throw new NotFoundException(`Evaluation job ${jobId} not found`);
    }

    return job;
  }
}
