import {
  IsString,
  IsArray,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { InterviewType } from '@prisma/client';

export class CreateInterviewDto {
  @IsString()
  applicationId: string;

  @IsArray()
  @IsString({ each: true })
  interviewerIds: string[];

  @IsOptional()
  @IsEnum(InterviewType)
  type?: InterviewType;

  @IsDateString()
  scheduledAt: string;
}
