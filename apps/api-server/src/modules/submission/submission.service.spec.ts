import { BadRequestException } from '@nestjs/common';
import { ContentType, SessionStatus } from '@shared/shared-types';
import { SubmissionService } from './submission.service';
import { Submission } from './entities/submission.entity';
import { InterviewSession } from '../session/entities/session.entity';

describe('SubmissionService', () => {
  const sessionRepository = {
    findOne: jest.fn(),
  };
  const transactionSessionRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const transactionSubmissionRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const dataSource = {
    transaction: jest.fn(),
  };
  const evaluationService = {
    createJob: jest.fn(),
  };

  const service = new SubmissionService(
    sessionRepository as never,
    dataSource as never,
    evaluationService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();

    dataSource.transaction.mockImplementation(async (callback) =>
      callback({
        getRepository: (entity: unknown) => {
          if (entity === Submission) {
            return transactionSubmissionRepository;
          }

          if (entity === InterviewSession) {
            return transactionSessionRepository;
          }

          throw new Error('Unknown repository');
        },
      }),
    );

    transactionSubmissionRepository.create.mockImplementation((input) => input);
    transactionSubmissionRepository.save.mockImplementation(async (input) => input);
    transactionSessionRepository.save.mockImplementation(async (input) => input);
    evaluationService.createJob.mockResolvedValue({ id: 'eval_1' });
  });

  it('creates a versioned submission and evaluation job', async () => {
    sessionRepository.findOne.mockResolvedValue({ id: 'ses_1', status: SessionStatus.IN_PROGRESS });
    transactionSessionRepository.findOne.mockResolvedValue({ id: 'ses_1', status: SessionStatus.IN_PROGRESS });
    transactionSubmissionRepository.findOne.mockResolvedValue({ versionNo: 2 });

    const result = await service.create('ses_1', {
      questionId: 'q_1',
      contentType: ContentType.CODE,
      contentRef: 'console.log(1)',
      language: 'typescript',
      evaluationConfig: {
        runnerType: 'stub',
        testCases: [{ id: 'tc_1', input: '1', expectedOutput: '1' }],
      },
    });

    expect(result).toEqual({
      submissionId: expect.stringMatching(/^sub_/),
      evaluationJobId: 'eval_1',
      version: 3,
      nextAction: 'evaluation_queued',
    });
    expect(evaluationService.createJob).toHaveBeenCalledWith({
      sessionId: 'ses_1',
      submissionId: expect.stringMatching(/^sub_/),
      idempotencyKey: undefined,
    });
  });

  it('rejects submissions when the session is not accepting them', async () => {
    sessionRepository.findOne.mockResolvedValue({ id: 'ses_1', status: SessionStatus.PENDING_CONSENT });

    await expect(
      service.create('ses_1', {
        questionId: 'q_1',
        contentType: ContentType.CODE,
        contentRef: 'console.log(1)',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
