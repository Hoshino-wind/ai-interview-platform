import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async createSession(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.create(createSessionDto);
  }

  @Get(':id')
  async getSession(@Param('id') id: string) {
    return this.sessionService.findOne(id);
  }

  @Post(':id/consent')
  async consent(@Param('id') id: string) {
    return this.sessionService.consent(id);
  }

  @Get(':id/timeline')
  async getTimeline(@Param('id') id: string) {
    return this.sessionService.getTimeline(id);
  }

  @Get(':id/iteration-timeline')
  async getIterationTimeline(@Param('id') id: string) {
    return this.sessionService.getIterationTimeline(id);
  }
}
