import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.teamsService.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Post()
  create(
    @Body()
    createTeamDto: {
      name: string;
      description?: string;
      companyId: string;
    },
  ) {
    return this.teamsService.create(createTeamDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateTeamDto: { name?: string; description?: string; active?: boolean },
  ) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamsService.remove(id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body('userId') userId: string) {
    return this.teamsService.addMember(id, userId);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.teamsService.removeMember(id, userId);
  }
}
