import { IsString, Length } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @Length(1, 64)
  candidateId: string;

  @IsString()
  @Length(1, 64)
  positionId: string;

  @IsString()
  @Length(1, 64)
  questionPackageId: string;
}
