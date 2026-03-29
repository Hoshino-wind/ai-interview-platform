import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsString,
} from 'class-validator';
import { QuestionType, Difficulty } from '@prisma/client';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  starterCode?: Record<string, string>;

  @IsOptional()
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }>;

  @IsOptional()
  hiddenTestCases?: Array<{
    input: string;
    expectedOutput: string;
  }>;

  @IsOptional()
  evaluationRubric?: Record<string, number>;

  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languageSupport?: string[];

  @IsOptional()
  aiScoringConfig?: Record<string, unknown>;
}
