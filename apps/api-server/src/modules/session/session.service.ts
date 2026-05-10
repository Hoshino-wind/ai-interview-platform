import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionStatus } from '@shared/shared-types';
import { InterviewSession } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { generateId } from '../../common/utils/generate-id';
import { ALLOWED_SESSION_TRANSITIONS, SessionTimelineEvent } from './session.types';
import { Submission } from '../submission/entities/submission.entity';
import { EvaluationJob } from '../evaluation/entities/evaluation-job.entity';
import { EvaluationResult } from '../evaluation/entities/evaluation-result.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(InterviewSession)
    private sessionRepository: Repository<InterviewSession>,
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    @InjectRepository(EvaluationJob)
    private evaluationJobRepository: Repository<EvaluationJob>,
    @InjectRepository(EvaluationResult)
    private evaluationResultRepository: Repository<EvaluationResult>,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<InterviewSession> {
    const session = this.sessionRepository.create(createSessionDto);
    session.id = generateId('ses');
    session.status = SessionStatus.PENDING_CONSENT;
    return this.sessionRepository.save(session);
  }

  async findOne(id: string): Promise<InterviewSession> {
    const session = await this.sessionRepository.findOne({ where: { id } });

    if (!session) {
      throw new NotFoundException(`Session ${id} not found`);
    }

    return session;
  }

  async consent(id: string): Promise<InterviewSession> {
    const session = await this.findOne(id);

    this.assertTransition(session.status, SessionStatus.IN_PROGRESS);
    session.status = SessionStatus.IN_PROGRESS;
    session.startedAt = session.startedAt ?? new Date();

    return this.sessionRepository.save(session);
  }

  async getTimeline(id: string): Promise<{ sessionId: string; status: SessionStatus; timeline: SessionTimelineEvent[] }> {
    const session = await this.findOne(id);
    const [submissions, jobs, results] = await Promise.all([
      this.submissionRepository.find({ where: { sessionId: id }, order: { versionNo: 'ASC' } }),
      this.evaluationJobRepository.find({ where: { sessionId: id }, order: { createdAt: 'ASC' } }),
      this.evaluationResultRepository.find({ where: { sessionId: id }, order: { createdAt: 'ASC' } }),
    ]);

    const timeline: SessionTimelineEvent[] = [
      {
        type: 'session_created',
        timestamp: session.createdAt,
        label: 'Session created',
        details: {
          candidateId: session.candidateId,
          positionId: session.positionId,
        },
      },
    ];

    if (session.startedAt) {
      timeline.push({
        type: 'consent_recorded',
        timestamp: session.startedAt,
        label: 'Candidate consent recorded',
      });
    }

    for (const submission of submissions) {
      timeline.push({
        type: 'submission_created',
        timestamp: submission.submittedAt,
        label: `Submission v${submission.versionNo}`,
        details: {
          submissionId: submission.id,
          questionId: submission.questionId,
          contentType: submission.contentType,
        },
      });
    }

    for (const job of jobs) {
      timeline.push({
        type: 'evaluation_queued',
        timestamp: job.createdAt,
        label: 'Evaluation queued',
        details: {
          evaluationJobId: job.id,
          submissionId: job.submissionId,
          status: job.status,
        },
      });
    }

    for (const result of results) {
      timeline.push({
        type: 'evaluation_completed',
        timestamp: result.createdAt,
        label: 'Evaluation completed',
        details: {
          evaluationJobId: result.evaluationJobId,
          autoScore: result.autoScore,
          gatePass: result.gatePass,
        },
      });
    }

    timeline.sort((left, right) => left.timestamp.getTime() - right.timestamp.getTime());

    return { sessionId: id, status: session.status, timeline };
  }

  async getIterationTimeline(id: string): Promise<{ sessionId: string; timeline: Array<Record<string, unknown>>; summary: Record<string, unknown> }> {
    const session = await this.findOne(id);
    const submissions = await this.submissionRepository.find({
      where: { sessionId: id },
      order: { versionNo: 'ASC' },
    });

    const timeline = submissions.map((submission) => ({
      submissionId: submission.id,
      versionNo: submission.versionNo,
      submittedAt: submission.submittedAt,
      iterationReason: submission.iterationReason,
      thoughtProcess: submission.thoughtProcess,
      aiPromptsUsed: submission.aiPromptsUsed ?? [],
    }));

    return {
      sessionId: id,
      timeline,
      summary: {
        sessionStatus: session.status,
        totalIterations: submissions.length,
        aiAssistedIterations: submissions.filter((submission) => (submission.aiPromptsUsed ?? []).length > 0).length,
      },
    };
  }

  async transitionTo(id: string, targetStatus: SessionStatus): Promise<InterviewSession> {
    const session = await this.findOne(id);

    this.assertTransition(session.status, targetStatus);
    session.status = targetStatus;

    if (targetStatus === SessionStatus.REVIEWING) {
      session.endedAt = session.endedAt ?? new Date();
    }

    return this.sessionRepository.save(session);
  }

  private assertTransition(current: SessionStatus, next: SessionStatus): void {
    const allowedTargets = ALLOWED_SESSION_TRANSITIONS[current] ?? [];

    if (!allowedTargets.includes(next)) {
      throw new BadRequestException(`Invalid session status transition: ${current} -> ${next}`);
    }
  }
}
