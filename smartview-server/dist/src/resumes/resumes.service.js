"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ResumesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const llm_service_1 = require("../llm/llm.service");
const fs_1 = require("fs");
const path_1 = require("path");
const client_1 = require("@prisma/client");
const pdfParse = require('pdf-parse');
let ResumesService = ResumesService_1 = class ResumesService {
    prisma;
    llmService;
    logger = new common_1.Logger(ResumesService_1.name);
    uploadsDir = (0, path_1.join)(process.cwd(), 'uploads', 'resumes');
    constructor(prisma, llmService) {
        this.prisma = prisma;
        this.llmService = llmService;
        this.ensureUploadsDir();
    }
    async ensureUploadsDir() {
        try {
            await fs_1.promises.mkdir(this.uploadsDir, { recursive: true });
        }
        catch (error) {
            this.logger.error('Failed to create uploads directory:', error);
        }
    }
    async uploadResume(candidateId, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (file.mimetype !== 'application/pdf') {
            throw new common_1.BadRequestException('Only PDF files are supported');
        }
        const timestamp = Date.now();
        const filename = `${candidateId}-${timestamp}.pdf`;
        const filepath = (0, path_1.join)(this.uploadsDir, filename);
        try {
            await fs_1.promises.writeFile(filepath, file.buffer);
        }
        catch (error) {
            this.logger.error('Failed to save file:', error);
            throw new common_1.InternalServerErrorException('Failed to save file');
        }
        const fileUrl = `/uploads/resumes/${filename}`;
        const existingResume = await this.prisma.resume.findUnique({
            where: { candidateId },
        });
        let resume;
        if (existingResume) {
            if (existingResume.fileUrl) {
                const oldFilename = existingResume.fileUrl.split('/').pop();
                const oldFilepath = (0, path_1.join)(this.uploadsDir, oldFilename);
                try {
                    await fs_1.promises.unlink(oldFilepath);
                }
                catch {
                }
            }
            resume = await this.prisma.resume.update({
                where: { candidateId },
                data: {
                    fileUrl,
                    parsedData: client_1.Prisma.JsonNull,
                },
            });
        }
        else {
            resume = await this.prisma.resume.create({
                data: {
                    candidateId,
                    fileUrl,
                },
            });
        }
        return {
            id: resume.id,
            fileUrl: resume.fileUrl,
            createdAt: resume.createdAt,
        };
    }
    async parseResume(candidateId) {
        const resume = await this.prisma.resume.findUnique({
            where: { candidateId },
        });
        if (!resume || !resume.fileUrl) {
            throw new common_1.NotFoundException('Resume not found. Please upload a resume first.');
        }
        const filename = resume.fileUrl.split('/').pop();
        const filepath = (0, path_1.join)(this.uploadsDir, filename);
        try {
            await fs_1.promises.access(filepath);
        }
        catch {
            throw new common_1.NotFoundException('Resume file not found');
        }
        let resumeText;
        try {
            const fileBuffer = await fs_1.promises.readFile(filepath);
            const pdfData = await pdfParse(fileBuffer);
            resumeText = pdfData.text;
        }
        catch (error) {
            this.logger.error('Failed to parse PDF:', error);
            throw new common_1.InternalServerErrorException('Failed to parse PDF file');
        }
        if (!resumeText || resumeText.trim().length === 0) {
            throw new common_1.BadRequestException('PDF file appears to be empty or contains only images');
        }
        const parsedData = await this.llmService.parseResume(resumeText);
        await this.prisma.resume.update({
            where: { candidateId },
            data: {
                parsedData: parsedData,
                skills: parsedData.skills,
                experience: parsedData.experience,
                education: parsedData.education,
            },
        });
        this.logger.log(`Resume parsed successfully for candidate ${candidateId}`);
        return parsedData;
    }
    async getMyResume(candidateId) {
        const resume = await this.prisma.resume.findUnique({
            where: { candidateId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!resume) {
            return null;
        }
        return resume;
    }
    async updateParsedData(candidateId, updateResumeDto) {
        const resume = await this.prisma.resume.findUnique({
            where: { candidateId },
        });
        if (!resume) {
            throw new common_1.NotFoundException('Resume not found');
        }
        const updatedResume = await this.prisma.resume.update({
            where: { candidateId },
            data: {
                parsedData: updateResumeDto.parsedData,
                skills: updateResumeDto.parsedData?.skills || resume.skills,
                experience: (updateResumeDto.parsedData?.experience ?? resume.experience),
                education: (updateResumeDto.parsedData?.education ?? resume.education),
            },
        });
        return updatedResume;
    }
};
exports.ResumesService = ResumesService;
exports.ResumesService = ResumesService = ResumesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_service_1.LLMService])
], ResumesService);
//# sourceMappingURL=resumes.service.js.map