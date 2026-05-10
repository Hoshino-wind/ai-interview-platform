import { NotFoundException } from '@nestjs/common';
import { QuestionParseStatus, QuestionType } from '@shared/shared-types';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
  const questionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const service = new QuestionService(questionRepository as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads a custom question with parse placeholder state', async () => {
    questionRepository.create.mockImplementation((input) => input);
    questionRepository.save.mockImplementation(async (input) => input);

    const result = await service.upload({
      title: 'Two Sum',
      stem: 'Implement two sum.',
      rawContent: '# Two Sum',
      sourceFormat: 'markdown',
      evaluationConfig: {
        runnerType: 'stub',
        testCases: [{ id: 'tc_1', input: '[2,7,11,15],9', expectedOutput: '[0,1]' }],
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^que_/),
        type: QuestionType.CUSTOM,
        parseStatus: QuestionParseStatus.NOT_STARTED,
      }),
    );
  });

  it('parses a question with placeholder parser output', async () => {
    const question = {
      id: 'que_1',
      title: 'Two Sum',
      parseStatus: QuestionParseStatus.NOT_STARTED,
    };

    questionRepository.findOne.mockResolvedValue(question);
    questionRepository.save.mockImplementation(async (input) => input);

    const result = await service.parse('que_1');

    expect(result.parseStatus).toBe(QuestionParseStatus.COMPLETED);
    expect(result.parseResult).toEqual(
      expect.objectContaining({
        parserVersion: 'placeholder-v1',
      }),
    );
  });

  it('uploads a markdown file and derives title from filename', async () => {
    questionRepository.create.mockImplementation((input) => input);
    questionRepository.save.mockImplementation(async (input) => input);

    const result = await service.uploadFile({
      originalname: 'graph-search.md',
      mimetype: 'text/markdown',
      buffer: Buffer.from('# Graph Search\n\nFind shortest path.'),
      size: 35,
    });

    expect(result).toEqual(
      expect.objectContaining({
        title: 'graph search',
        stem: '# Graph Search\n\nFind shortest path.',
        sourceFormat: 'markdown',
      }),
    );
  });

  it('uploads a json file and reads question fields from file content', async () => {
    questionRepository.create.mockImplementation((input) => input);
    questionRepository.save.mockImplementation(async (input) => input);

    const result = await service.uploadFile({
      originalname: 'two-sum.json',
      mimetype: 'application/json',
      buffer: Buffer.from(JSON.stringify({
        title: 'Two Sum',
        stem: 'Implement two sum.',
        evaluationConfig: {
          runnerType: 'stub',
          testCases: [{ id: 'tc_1', input: '1', expectedOutput: '1' }],
        },
      })),
      size: 120,
    });

    expect(result).toEqual(
      expect.objectContaining({
        title: 'Two Sum',
        sourceFormat: 'json',
        evaluationConfig: expect.objectContaining({
          runnerType: 'stub',
        }),
      }),
    );
  });

  it('throws when the question does not exist', async () => {
    questionRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects invalid json uploads', async () => {
    await expect(
      service.uploadFile({
        originalname: 'broken.json',
        mimetype: 'application/json',
        buffer: Buffer.from('{not-json}'),
        size: 10,
      }),
    ).rejects.toThrow('Question JSON file is invalid');
  });
});
