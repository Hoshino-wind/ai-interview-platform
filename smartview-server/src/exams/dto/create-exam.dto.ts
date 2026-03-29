import {
  IsNotEmpty,
  IsUUID,
  IsArray,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class CreateExamDto {
  @IsNotEmpty()
  @IsUUID()
  applicationId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  questionIds: string[];

  @IsOptional()
  @IsInt()
  @Min(60)
  timeLimit?: number; // in seconds, default 7200 (2 hours)
}
