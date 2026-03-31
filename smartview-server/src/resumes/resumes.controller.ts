import {
  Controller,
  Post,
  Get,
  Put,
  UseGuards,
  UseInterceptors,
  Body,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ResumesService } from './resumes.service';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { memoryStorage } from 'multer';

@Controller('resumes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post('upload')
  @Roles('CANDIDATE')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (file.mimetype === 'application/pdf') {
          callback(null, true);
        } else {
          callback(new Error('Only PDF files are allowed'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.resumesService.uploadResume(req.user.id, file);
  }

  @Post('parse')
  @Roles('CANDIDATE')
  async parseResume(@Request() req: any) {
    return this.resumesService.parseResume(req.user.id);
  }

  @Get('me')
  @Roles('CANDIDATE')
  async getMyResume(@Request() req: any) {
    return this.resumesService.getMyResume(req.user.id);
  }

  @Put('me')
  @Roles('CANDIDATE')
  async updateParsedData(
    @Request() req: any,
    @Body() updateResumeDto: UpdateResumeDto,
  ) {
    return this.resumesService.updateParsedData(req.user.id, updateResumeDto);
  }
}
