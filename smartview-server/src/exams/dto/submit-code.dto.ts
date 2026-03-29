import { IsNotEmpty, IsIn, IsString } from 'class-validator';

export class SubmitCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsIn(['javascript', 'typescript', 'python'])
  language: string;
}
