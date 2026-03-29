import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsString,
} from 'class-validator';
import { QuestionType, Difficulty } from '@prisma/client';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(QuestionType)
  type: QuestionType;

  @IsNotEmpty()
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsOptional()
  starterCode?: Record<string, string>;

  @IsNotEmpty()
  testCases: Array<{
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
  timeLimit?: number = 3600;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languageSupport?: string[] = ['javascript', 'python'];

  @IsOptional()
  aiScoringConfig?: Record<string, unknown>;
}
