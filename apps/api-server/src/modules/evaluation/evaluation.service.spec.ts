import { EvaluationJobStatus, SessionStatus } from '@shared/shared-types';
import { EvaluationService } from './evaluation.service';

describe('EvaluationService', () => {
  const evaluationJobRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const evaluationResultRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const sessionRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const evaluationQueue = {
    add: jest.fn(),
  };

  const service = new EvaluationService(
    evaluationJobRepository as never,
    evaluationResultRepository as never,
    sessionRepository as never,
    evaluationQueue as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    evaluationJobRepository.create.mockImplementation((input) => input);
    evaluationJobRepository.save.mockImplementation(async (input) => input);
    evaluationResultRepository.create.mockImplementation((input) => input);
    evaluationResultRepository.save.mockImplementation(async (input) => input);
    sessionRepository.save.mockImplementation(async (input) => input);
  });

  it('creates and enqueues a new evaluation job', async () => {
    evaluationJobRepository.findOne.mockResolvedValue(null);

    const result = await service.createJob({
      sessionId: 'ses_1',
      submissionId: 'sub_1',
      idempotencyKey: 'idem_1',
    });

    expect(result.status).toBe(EvaluationJobStatus.PENDING);
    expect(evaluationQueue.add).toHaveBeenCalledWith(
      'evaluate',
      expect.objectContaining({ sessionId: 'ses_1', submissionId: 'sub_1' }),
      expect.objectContaining({ jobId: expect.stringMatching(/^eval_/) }),
    );
  });

  it('completes a job and moves the session to reviewing', async () => {
    evaluationJobRepository.findOne.mockResolvedValue({
      id: 'eval_1',
      sessionId: 'ses_1',
      submissionId: 'sub_1',
      status: EvaluationJobStatus.RUNNING,
    });
    sessionRepository.findOne.mockResolvedValue({
      id: 'ses_1',
      status: SessionStatus.EVALUATING,
      endedAt: undefined,
    });

    const result = await service.completeJob({
      jobId: 'eval_1',
      autoScore: 82,
      gatePass: true,
      metrics: { totalCases: 10, passedCases: 9 },
    });

    expect(result.autoScore).toBe(82);
    expect(sessionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: SessionStatus.REVIEWING }),
    );
  });
});
