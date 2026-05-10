import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SessionStatus } from '@shared/shared-types';
import { Submission } from './entities/submission.entity';
import { InterviewSession } from '../session/entities/session.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { generateId } from '../../common/utils/generate-id';
import { EvaluationService } from '../evaluation/evaluation.service';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(InterviewSession)
    private sessionRepository: Repository<InterviewSession>,
    private dataSource: DataSource,
    private evaluationService: EvaluationService,
  ) {}

  async create(
    sessionId: string,
    createSubmissionDto: CreateSubmissionDto,
    idempotencyKey?: string,
  ): Promise<any> {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId } });

    if (!session) {
      throw new BadRequestException(`Session ${sessionId} not found`);
    }

    if (![SessionStatus.IN_PROGRESS, SessionStatus.EVALUATING].includes(session.status)) {
      throw new BadRequestException(`Session ${sessionId} is not accepting submissions in status ${session.status}`);
    }

    const submission = await this.dataSource.transaction(async (manager) => {
      const submissionRepository = manager.getRepository(Submission);
      const sessionRepository = manager.getRepository(InterviewSession);
      const lockedSession = await sessionRepository.findOne({
        where: { id: sessionId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedSession) {
        throw new BadRequestException(`Session ${sessionId} not found`);
      }

      const latestSubmission = await submissionRepository.findOne({
        where: { sessionId },
        order: { versionNo: 'DESC' },
      });

      const nextVersionNo = (latestSubmission?.versionNo ?? 0) + 1;
      const entity = submissionRepository.create({
        id: generateId('sub'),
        sessionId,
        versionNo: nextVersionNo,
        ...createSubmissionDto,
      });

      const savedSubmission = await submissionRepository.save(entity);

      if (lockedSession.status !== SessionStatus.EVALUATING) {
        lockedSession.status = SessionStatus.EVALUATING;
        await sessionRepository.save(lockedSession);
      }

      return savedSubmission;
    });

    const evaluationJob = await this.evaluationService.createJob({
      sessionId,
      submissionId: submission.id,
      idempotencyKey,
    });

    return {
      submissionId: submission.id,
      evaluationJobId: evaluationJob.id,
      version: submission.versionNo,
      nextAction: 'evaluation_queued',
    };
  }
}
