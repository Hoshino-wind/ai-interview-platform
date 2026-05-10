import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SessionStatus } from '@shared/shared-types';
import { SessionService } from './session.service';

describe('SessionService', () => {
  const sessionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const submissionRepository = { find: jest.fn() };
  const evaluationJobRepository = { find: jest.fn() };
  const evaluationResultRepository = { find: jest.fn() };

  const service = new SessionService(
    sessionRepository as never,
    submissionRepository as never,
    evaluationJobRepository as never,
    evaluationResultRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a session with pending consent status', async () => {
    const saved = {
      id: 'ses_1',
      candidateId: 'cand_1',
      positionId: 'pos_1',
      questionPackageId: 'pkg_1',
      status: SessionStatus.PENDING_CONSENT,
    };

    sessionRepository.create.mockImplementation((input) => input);
    sessionRepository.save.mockResolvedValue(saved);

    const result = await service.create({
      candidateId: 'cand_1',
      positionId: 'pos_1',
      questionPackageId: 'pkg_1',
    });

    expect(result.status).toBe(SessionStatus.PENDING_CONSENT);
    expect(sessionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(/^ses_/),
        status: SessionStatus.PENDING_CONSENT,
      }),
    );
  });

  it('records consent by transitioning to in progress', async () => {
    const session = {
      id: 'ses_1',
      status: SessionStatus.PENDING_CONSENT,
      startedAt: undefined,
    };

    sessionRepository.findOne.mockResolvedValue(session);
    sessionRepository.save.mockImplementation(async (input) => input);

    const result = await service.consent('ses_1');

    expect(result.status).toBe(SessionStatus.IN_PROGRESS);
    expect(result.startedAt).toBeInstanceOf(Date);
  });

  it('rejects invalid session transitions', async () => {
    sessionRepository.findOne.mockResolvedValue({
      id: 'ses_1',
      status: SessionStatus.DRAFT,
    });

    await expect(service.consent('ses_1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when the session does not exist', async () => {
    sessionRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
