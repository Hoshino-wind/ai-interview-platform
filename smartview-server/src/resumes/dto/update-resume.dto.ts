import { IsOptional, IsObject, IsArray, IsString, IsNumber } from 'class-validator';

export class UploadResumeDto {
  // File is handled by FileInterceptor, no need for DTO fields
}

export class ExperienceItem {
  @IsString()
  company: string;

  @IsString()
  role: string;

  @IsNumber()
  years: number;

  @IsArray()
  @IsString({ each: true })
  techStack: string[];

  @IsString()
  description: string;
}

export class EducationItem {
  @IsString()
  school: string;

  @IsString()
  degree: string;

  @IsString()
  major: string;

  @IsNumber()
  year: number;
}

export class ProjectItem {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  techStack: string[];
}

export class ParsedDataDto {
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsArray()
  @IsOptional()
  experience?: ExperienceItem[];

  @IsArray()
  @IsOptional()
  education?: EducationItem[];

  @IsArray()
  @IsOptional()
  projects?: ProjectItem[];

  @IsNumber()
  yearsOfExperience: number;

  @IsString()
  seniorityLevel: 'junior' | 'mid' | 'mid-senior' | 'senior' | 'expert';
}

export class UpdateResumeDto {
  @IsObject()
  @IsOptional()
  parsedData?: ParsedDataDto;
}
