import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '@shared/shared-types';

class EvaluationTestCaseDto {
  @IsString()
  @Length(1, 64)
  id: string;

  @IsString()
  @Length(0, 5000)
  input: string;

  @IsString()
  @Length(0, 5000)
  expectedOutput: string;

  @IsOptional()
  isHidden?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  weight?: number;
}

class EvaluationConfigDto {
  @IsIn(['stub'])
  runnerType: 'stub';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluationTestCaseDto)
  testCases: EvaluationTestCaseDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMs?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  memoryLimitMb?: number;
}

export class UploadQuestionDto {
  @IsString()
  @Length(1, 200)
  title: string;

  @IsOptional()
  @IsString()
  type?: QuestionType;

  @IsString()
  @Length(1, 20000)
  stem: string;

  @IsOptional()
  @IsString()
  @Length(1, 40000)
  rawContent?: string;

  @IsOptional()
  @IsIn(['markdown', 'plain_text', 'json'])
  sourceFormat?: 'markdown' | 'plain_text' | 'json';

  @IsOptional()
  @ValidateNested()
  @Type(() => EvaluationConfigDto)
  evaluationConfig?: EvaluationConfigDto;
}
