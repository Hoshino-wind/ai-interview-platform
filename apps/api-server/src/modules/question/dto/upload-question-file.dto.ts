import { IsIn, IsOptional, IsString, Length } from 'class-validator';
import { QuestionType } from '@shared/shared-types';

export class UploadQuestionFileDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string;

  @IsOptional()
  @IsString()
  type?: QuestionType;

  @IsOptional()
  @IsIn(['markdown', 'plain_text', 'json'])
  sourceFormat?: 'markdown' | 'plain_text' | 'json';

  @IsOptional()
  @IsString()
  evaluationConfig?: string;
}
