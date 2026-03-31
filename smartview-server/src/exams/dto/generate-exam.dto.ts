import { IsUUID, IsNotEmpty } from 'class-validator';

export class GenerateExamDto {
  @IsUUID()
  @IsNotEmpty()
  applicationId: string;
}
