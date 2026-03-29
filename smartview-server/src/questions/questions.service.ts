import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Question, Prisma } from '@prisma/client';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QueryQuestionDto } from './dto/query-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    return this.prisma.question.create({
      data: createQuestionDto as Prisma.QuestionCreateInput,
    });
  }

  async findAll(queryDto: QueryQuestionDto): Promise<{
    data: Question[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = parseInt(queryDto.page || '1', 10);
    const limit = parseInt(queryDto.limit || '10', 10);
    const skip = (page - 1) * limit;

    // Build where clause dynamically
    const where: Prisma.QuestionWhereInput = {};

    if (queryDto.type) {
      where.type = queryDto.type;
    }

    if (queryDto.difficulty) {
      where.difficulty = queryDto.difficulty;
    }

    if (queryDto.tags) {
      const tagsArray = queryDto.tags.split(',').map((tag) => tag.trim());
      where.tags = {
        hasSome: tagsArray,
      };
    }

    if (queryDto.language) {
      where.languageSupport = {
        has: queryDto.language,
      };
    }

    if (queryDto.search) {
      where.title = {
        contains: queryDto.search,
        mode: 'insensitive',
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.question.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID "${id}" not found`);
    }

    return question;
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    // Check if question exists
    await this.findOne(id);

    return this.prisma.question.update({
      where: { id },
      data: updateQuestionDto as Prisma.QuestionUpdateInput,
    });
  }

  async remove(id: string): Promise<Question> {
    // Check if question exists
    await this.findOne(id);

    return this.prisma.question.delete({
      where: { id },
    });
  }
}
