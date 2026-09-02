import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { tenantScope } from '../auth/tenant.util';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.teamsService.findAll(tenantScope(user));
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const team = await this.teamsService.findOne(id, tenantScope(user));
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  @Post()
  create(
    @Body() body: { name: string; description?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!user?.companyId) {
      throw new BadRequestException('Usuário sem companyId no token.');
    }
    return this.teamsService.create({ ...body, companyId: user.companyId });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: { name?: string; description?: string; active?: boolean },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const team = await this.teamsService.update(id, body, tenantScope(user));
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const removed = await this.teamsService.remove(id, tenantScope(user));
    if (!removed) throw new NotFoundException('Team not found');
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.teamsService.addMember(
      id,
      body.userId,
      tenantScope(user),
    );
    if (!result) throw new NotFoundException('Team or user not found');
    return result;
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.teamsService.removeMember(
      id,
      userId,
      tenantScope(user),
    );
    if (!result) throw new NotFoundException('Team or user not found');
    return result;
  }
}
