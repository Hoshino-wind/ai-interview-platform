import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadQuestionFileDto } from './dto/upload-question-file.dto';
import { UploadQuestionDto } from './dto/upload-question.dto';
import { QuestionService } from './question.service';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('upload')
  async upload(@Body() uploadQuestionDto: UploadQuestionDto) {
    return this.questionService.upload(uploadQuestionDto);
  }

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file?: { originalname: string; mimetype: string; buffer: Buffer; size: number },
    @Body() uploadQuestionFileDto?: UploadQuestionFileDto,
  ) {
    return this.questionService.uploadFile(file, uploadQuestionFileDto);
  }

  @Get()
  async getQuestions() {
    return this.questionService.findAll();
  }

  @Get(':id')
  async getQuestion(@Param('id') id: string) {
    return this.questionService.findOne(id);
  }

  @Post(':id/parse')
  async parseQuestion(@Param('id') id: string) {
    return this.questionService.parse(id);
  }
}
