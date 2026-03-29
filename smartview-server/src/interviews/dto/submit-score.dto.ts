import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class SubmitScoreDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  techDepth: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  communication: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  overallQuality: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  cultureFit: number;

  @IsOptional()
  @IsString()
  comments?: string;
}
