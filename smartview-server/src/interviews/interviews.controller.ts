import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { SubmitScoreDto } from './dto/submit-score.dto';
import { QueryInterviewDto } from './dto/query-interview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  type CurrentUserData,
} from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR, UserRole.ADMIN)
  create(@Body() dto: CreateInterviewDto) {
    return this.interviewsService.create(dto);
  }

  @Get()
  findAll(
    @Query() query: QueryInterviewDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.interviewsService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.interviewsService.findOne(id, user);
  }

  @Post(':id/score')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INTERVIEWER, UserRole.HR, UserRole.ADMIN)
  submitScore(
    @Param('id') id: string,
    @Body() dto: SubmitScoreDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.interviewsService.submitScore(id, dto, user.userId);
  }

  @Get(':id/scores')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INTERVIEWER, UserRole.HR, UserRole.ADMIN)
  getScores(@Param('id') id: string) {
    return this.interviewsService.getScores(id);
  }
}
