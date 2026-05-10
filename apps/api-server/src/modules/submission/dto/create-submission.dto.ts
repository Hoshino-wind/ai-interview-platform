import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsIn, IsInt, IsOptional, IsString, Length, Min, ValidateNested } from 'class-validator';
import { ContentType } from '@shared/shared-types';

class AIPromptUsedDto {
  @IsString()
  @Length(1, 4000)
  prompt: string;

  @IsString()
  @Length(1, 128)
  timestamp: string;
}

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

export class CreateSubmissionDto {
  @IsString()
  @Length(1, 64)
  questionId: string;

  @IsEnum(ContentType)
  contentType: ContentType;

  @IsString()
  @Length(1, 20000)
  contentRef: string;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  language?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  thoughtProcess?: string;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  iterationReason?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AIPromptUsedDto)
  aiPromptsUsed?: AIPromptUsedDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => EvaluationConfigDto)
  evaluationConfig?: EvaluationConfigDto;

  @IsOptional()
  @IsString()
  @Length(1, 5000)
  notes?: string;
}
