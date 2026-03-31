import { ResumesService } from './resumes.service';
import { UpdateResumeDto } from './dto/update-resume.dto';
export declare class ResumesController {
    private readonly resumesService;
    constructor(resumesService: ResumesService);
    uploadResume(file: Express.Multer.File, req: any): Promise<{
        id: string;
        fileUrl: string;
        createdAt: Date;
    }>;
    parseResume(req: any): Promise<import("../llm/types").ResumeParsedData>;
    getMyResume(req: any): Promise<({
        candidate: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        candidateId: string;
        fileUrl: string | null;
        parsedData: import("@prisma/client/runtime/client").JsonValue | null;
        skills: string[];
        experience: import("@prisma/client/runtime/client").JsonValue | null;
        education: import("@prisma/client/runtime/client").JsonValue | null;
        visibility: string;
    }) | null>;
    updateParsedData(req: any, updateResumeDto: UpdateResumeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        candidateId: string;
        fileUrl: string | null;
        parsedData: import("@prisma/client/runtime/client").JsonValue | null;
        skills: string[];
        experience: import("@prisma/client/runtime/client").JsonValue | null;
        education: import("@prisma/client/runtime/client").JsonValue | null;
        visibility: string;
    }>;
}
