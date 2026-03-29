import {
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class TestCaseDto {
  @IsString()
  @IsNotEmpty()
  input: string;

  @IsString()
  @IsNotEmpty()
  expectedOutput: string;
}

export class RunCodeDto {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @IsIn(['javascript', 'typescript', 'python'])
  language: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases?: TestCaseDto[];
}
