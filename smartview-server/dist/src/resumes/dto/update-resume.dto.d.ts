export declare class UploadResumeDto {
}
export declare class ExperienceItem {
    company: string;
    role: string;
    years: number;
    techStack: string[];
    description: string;
}
export declare class EducationItem {
    school: string;
    degree: string;
    major: string;
    year: number;
}
export declare class ProjectItem {
    name: string;
    description: string;
    techStack: string[];
}
export declare class ParsedDataDto {
    skills: string[];
    experience?: ExperienceItem[];
    education?: EducationItem[];
    projects?: ProjectItem[];
    yearsOfExperience: number;
    seniorityLevel: 'junior' | 'mid' | 'mid-senior' | 'senior' | 'expert';
}
export declare class UpdateResumeDto {
    parsedData?: ParsedDataDto;
}
