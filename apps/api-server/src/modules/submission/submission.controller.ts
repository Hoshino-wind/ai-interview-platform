import { Controller, Post, Body, Param, Headers } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Controller('sessions/:sessionId/submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Param('sessionId') sessionId: string,
    @Body() createSubmissionDto: CreateSubmissionDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.submissionService.create(sessionId, createSubmissionDto, idempotencyKey);
  }
}
