import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateDecisionDto } from './dto/update-decision.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  type CurrentUserData,
} from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CANDIDATE)
  create(
    @Body() dto: CreateApplicationDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.applicationsService.create(dto, user.userId);
  }

  @Get()
  findAll(
    @Query() query: QueryApplicationDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.applicationsService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.applicationsService.findOne(id, user);
  }

  @Post(':id/finalize')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR, UserRole.ADMIN)
  finalize(@Param('id') id: string) {
    return this.applicationsService.finalize(id);
  }

  @Put(':id/decision')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR, UserRole.ADMIN)
  updateDecision(@Param('id') id: string, @Body() dto: UpdateDecisionDto) {
    return this.applicationsService.updateDecision(id, dto);
  }

  @Get(':id/report')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INTERVIEWER, UserRole.HR, UserRole.ADMIN)
  getReport(@Param('id') id: string) {
    return this.applicationsService.getReport(id);
  }
}
