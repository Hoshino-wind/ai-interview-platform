import { IsEnum } from 'class-validator';
import { Decision } from '@prisma/client';

export class UpdateDecisionDto {
  @IsEnum(Decision)
  decision: Decision;
}
