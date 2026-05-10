import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationConfig, QuestionParseStatus, QuestionType } from '@shared/shared-types';
import { generateId } from '../../common/utils/generate-id';
import { UploadQuestionFileDto } from './dto/upload-question-file.dto';
import { UploadQuestionDto } from './dto/upload-question.dto';
import { Question } from './entities/question.entity';

interface UploadedQuestionFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async upload(uploadQuestionDto: UploadQuestionDto): Promise<Question> {
    const question = this.questionRepository.create({
      id: generateId('que'),
      title: uploadQuestionDto.title,
      type: uploadQuestionDto.type ?? QuestionType.CUSTOM,
      stem: uploadQuestionDto.stem,
      rawContent: uploadQuestionDto.rawContent,
      sourceFormat: uploadQuestionDto.sourceFormat ?? 'markdown',
      evaluationConfig: uploadQuestionDto.evaluationConfig,
      parseStatus: QuestionParseStatus.NOT_STARTED,
    });

    return this.questionRepository.save(question);
  }

  async uploadFile(file?: UploadedQuestionFile, uploadQuestionFileDto?: UploadQuestionFileDto): Promise<Question> {
    if (!file) {
      throw new BadRequestException('Question file is required');
    }

    if (file.size === 0) {
      throw new BadRequestException('Question file cannot be empty');
    }

    const normalizedQuestion = this.normalizeUploadedFile(file, uploadQuestionFileDto);
    return this.upload(normalizedQuestion);
  }

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({ where: { id } });

    if (!question) {
      throw new NotFoundException(`Question ${id} not found`);
    }

    return question;
  }

  async parse(id: string): Promise<Question> {
    const question = await this.findOne(id);
    question.parseRequestedAt = new Date();
    question.parsedAt = new Date();
    question.parseStatus = QuestionParseStatus.COMPLETED;
    question.parseResult = {
      summary: 'Question parser placeholder executed. Real parsing is not implemented yet.',
      extractedSections: [],
      parserVersion: 'placeholder-v1',
      notes: 'Current implementation only records parse intent so a real parser can replace it later.',
    };

    return this.questionRepository.save(question);
  }

  private normalizeUploadedFile(
    file: UploadedQuestionFile,
    uploadQuestionFileDto?: UploadQuestionFileDto,
  ): UploadQuestionDto {
    const fileContent = file.buffer.toString('utf8').trim();

    if (!fileContent) {
      throw new BadRequestException('Question file content cannot be empty');
    }

    const normalizedFilename = file.originalname.toLowerCase();
    const inferredSourceFormat = uploadQuestionFileDto?.sourceFormat
      ?? (normalizedFilename.endsWith('.json')
        ? 'json'
        : normalizedFilename.endsWith('.txt')
          ? 'plain_text'
          : 'markdown');

    const fallbackTitle = this.getTitleFromFilename(file.originalname);
    const parsedEvaluationConfig = this.parseEvaluationConfig(uploadQuestionFileDto?.evaluationConfig);

    if (inferredSourceFormat === 'json') {
      return this.normalizeJsonQuestion(fileContent, uploadQuestionFileDto?.title ?? fallbackTitle, parsedEvaluationConfig);
    }

    return {
      title: uploadQuestionFileDto?.title ?? fallbackTitle,
      type: uploadQuestionFileDto?.type,
      stem: fileContent,
      rawContent: fileContent,
      sourceFormat: inferredSourceFormat,
      evaluationConfig: parsedEvaluationConfig,
    };
  }

  private normalizeJsonQuestion(
    fileContent: string,
    fallbackTitle: string,
    overrideEvaluationConfig?: EvaluationConfig,
  ): UploadQuestionDto {
    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(fileContent) as Record<string, unknown>;
    } catch {
      throw new BadRequestException('Question JSON file is invalid');
    }

    const title = typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title : fallbackTitle;
    const stem = typeof parsed.stem === 'string' && parsed.stem.trim()
      ? parsed.stem
      : typeof parsed.rawContent === 'string' && parsed.rawContent.trim()
        ? parsed.rawContent
        : null;

    if (!stem) {
      throw new BadRequestException('Question JSON must include a non-empty stem or rawContent');
    }

    return {
      title,
      type: typeof parsed.type === 'string' ? (parsed.type as QuestionType) : undefined,
      stem,
      rawContent: typeof parsed.rawContent === 'string' ? parsed.rawContent : fileContent,
      sourceFormat: 'json',
      evaluationConfig: overrideEvaluationConfig ?? this.maybeReadEvaluationConfig(parsed.evaluationConfig),
    };
  }

  private maybeReadEvaluationConfig(value: unknown): EvaluationConfig | undefined {
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    return value as EvaluationConfig;
  }

  private parseEvaluationConfig(rawValue?: string): EvaluationConfig | undefined {
    if (!rawValue) {
      return undefined;
    }

    try {
      return JSON.parse(rawValue) as EvaluationConfig;
    } catch {
      throw new BadRequestException('evaluationConfig must be valid JSON');
    }
  }

  private getTitleFromFilename(filename: string): string {
    const normalized = filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
    return normalized || 'Uploaded Question';
  }
}
