import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { SandboxService } from '../sandbox/sandbox.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitCodeDto } from './dto/submit-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  type CurrentUserData,
} from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly sandboxService: SandboxService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR)
  async create(@Body() createExamDto: CreateExamDto) {
    const exam = await this.examsService.create(createExamDto);
    return {
      success: true,
      data: exam,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{
    success: boolean;
    data: unknown;
  }> {
    const result = await this.examsService.findOne(id, user);
    return {
      success: true,
      data: result as unknown,
    };
  }

  @Post(':id/start')
  async startExam(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const exam = await this.examsService.startExam(id, user);
    return {
      success: true,
      data: exam,
    };
  }

  @Put(':id/submissions/:questionId')
  async saveSubmission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() submitCodeDto: SubmitCodeDto,
  ) {
    const submission = await this.examsService.saveSubmission(
      id,
      questionId,
      user,
      submitCodeDto,
    );
    return {
      success: true,
      data: submission,
    };
  }

  @Post(':id/submissions/:questionId/run')
  async runCode(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() submitCodeDto: SubmitCodeDto,
  ) {
    const result = await this.examsService.runCode(
      id,
      questionId,
      user,
      submitCodeDto,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  async submitExam(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.examsService.submitExam(id, user);
    return {
      success: true,
      data: result.exam,
      message: result.message,
    };
  }

  @Get(':id/status')
  async getStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const status = await this.examsService.getStatus(id, user);
    return {
      success: true,
      data: status,
    };
  }
}
