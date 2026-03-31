import { PrismaService } from '../prisma/prisma.service';
import { LLMService, ResumeParsedData } from '../llm/llm.service';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Prisma } from '@prisma/client';
export declare class ResumesService {
    private readonly prisma;
    private readonly llmService;
    private readonly logger;
    private readonly uploadsDir;
    constructor(prisma: PrismaService, llmService: LLMService);
    private ensureUploadsDir;
    uploadResume(candidateId: string, file: Express.Multer.File): Promise<{
        id: string;
        fileUrl: string;
        createdAt: Date;
    }>;
    parseResume(candidateId: string): Promise<ResumeParsedData>;
    getMyResume(candidateId: string): Promise<({
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
        parsedData: Prisma.JsonValue | null;
        skills: string[];
        experience: Prisma.JsonValue | null;
        education: Prisma.JsonValue | null;
        visibility: string;
    }) | null>;
    updateParsedData(candidateId: string, updateResumeDto: UpdateResumeDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        candidateId: string;
        fileUrl: string | null;
        parsedData: Prisma.JsonValue | null;
        skills: string[];
        experience: Prisma.JsonValue | null;
        education: Prisma.JsonValue | null;
        visibility: string;
    }>;
}
