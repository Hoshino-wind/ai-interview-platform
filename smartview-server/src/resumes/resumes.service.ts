import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LLMService, ResumeParsedData } from '../llm/llm.service';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Prisma } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);
  private readonly uploadsDir = join(process.cwd(), 'uploads', 'resumes');

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
  ) {
    // Ensure uploads directory exists
    this.ensureUploadsDir();
  }

  private async ensureUploadsDir() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create uploads directory:', error);
    }
  }

  async uploadResume(
    candidateId: string,
    file: Express.Multer.File,
  ): Promise<{ id: string; fileUrl: string; createdAt: Date }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are supported');
    }

    // Generate filename
    const timestamp = Date.now();
    const filename = `${candidateId}-${timestamp}.pdf`;
    const filepath = join(this.uploadsDir, filename);

    // Save file to disk
    try {
      await fs.writeFile(filepath, file.buffer);
    } catch (error) {
      this.logger.error('Failed to save file:', error);
      throw new InternalServerErrorException('Failed to save file');
    }

    const fileUrl = `/uploads/resumes/${filename}`;

    // Create or update resume record
    const existingResume = await this.prisma.resume.findUnique({
      where: { candidateId },
    });

    let resume;
    if (existingResume) {
      // Delete old file if exists
      if (existingResume.fileUrl) {
        const oldFilename = existingResume.fileUrl.split('/').pop();
        const oldFilepath = join(this.uploadsDir, oldFilename!);
        try {
          await fs.unlink(oldFilepath);
        } catch {
          // Ignore if file doesn't exist
        }
      }

      resume = await this.prisma.resume.update({
        where: { candidateId },
        data: {
          fileUrl,
          parsedData: Prisma.JsonNull, // Reset parsed data on new upload
        },
      });
    } else {
      resume = await this.prisma.resume.create({
        data: {
          candidateId,
          fileUrl,
        },
      });
    }

    return {
      id: resume.id,
      fileUrl: resume.fileUrl!,
      createdAt: resume.createdAt,
    };
  }

  async parseResume(candidateId: string): Promise<ResumeParsedData> {
    const resume = await this.prisma.resume.findUnique({
      where: { candidateId },
    });

    if (!resume || !resume.fileUrl) {
      throw new NotFoundException('Resume not found. Please upload a resume first.');
    }

    // Get file path
    const filename = resume.fileUrl.split('/').pop();
    const filepath = join(this.uploadsDir, filename!);

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      throw new NotFoundException('Resume file not found');
    }

    // Read and parse PDF
    let resumeText: string;
    try {
      const fileBuffer = await fs.readFile(filepath);
      const pdfData = await pdfParse(fileBuffer);
      resumeText = pdfData.text;
    } catch (error) {
      this.logger.error('Failed to parse PDF:', error);
      throw new InternalServerErrorException('Failed to parse PDF file');
    }

    if (!resumeText || resumeText.trim().length === 0) {
      throw new BadRequestException('PDF file appears to be empty or contains only images');
    }

    // Parse with LLM
    const parsedData = await this.llmService.parseResume(resumeText);

    // Save parsed data to database
    await this.prisma.resume.update({
      where: { candidateId },
      data: {
        parsedData: parsedData as unknown as Prisma.InputJsonValue,
        skills: parsedData.skills,
        experience: parsedData.experience as unknown as Prisma.InputJsonValue,
        education: parsedData.education as unknown as Prisma.InputJsonValue,
      },
    });

    this.logger.log(`Resume parsed successfully for candidate ${candidateId}`);
    return parsedData;
  }

  async getMyResume(candidateId: string) {
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

  async updateParsedData(
    candidateId: string,
    updateResumeDto: UpdateResumeDto,
  ) {
    const resume = await this.prisma.resume.findUnique({
      where: { candidateId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    const updatedResume = await this.prisma.resume.update({
      where: { candidateId },
      data: {
        parsedData: updateResumeDto.parsedData as unknown as Prisma.InputJsonValue,
        skills: updateResumeDto.parsedData?.skills || resume.skills,
        experience: (updateResumeDto.parsedData?.experience ?? resume.experience) as unknown as Prisma.InputJsonValue,
        education: (updateResumeDto.parsedData?.education ?? resume.education) as unknown as Prisma.InputJsonValue,
      },
    });

    return updatedResume;
  }
}
