import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { SprintsService } from './sprints.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { tenantScope } from '../auth/tenant.util';

@Controller('sprints')
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Get()
  findAll(
    @Query('projectId') projectId: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const companyId = tenantScope(user);
    if (projectId) {
      return this.sprintsService.findByProject(projectId, companyId);
    }
    return this.sprintsService.findAll(companyId);
  }

  @Get('project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sprintsService.findByProject(projectId, tenantScope(user));
  }

  @Get(':id/burndown')
  async getBurndown(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.sprintsService.getBurndown(id, tenantScope(user));
    if (!data) throw new NotFoundException('Sprint not found');
    return data;
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const sprint = await this.sprintsService.findOne(id, tenantScope(user));
    if (!sprint) throw new NotFoundException('Sprint not found');
    return sprint;
  }

  @Post()
  create(@Body() body: CreateSprintDto, @CurrentUser() user: AuthenticatedUser) {
    return this.sprintsService.create(
      {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      } as any,
      tenantScope(user),
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSprintDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data: any = { ...body };
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);
    const sprint = await this.sprintsService.update(
      id,
      data,
      tenantScope(user),
    );
    if (!sprint) throw new NotFoundException('Sprint not found');
    return sprint;
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const deleted = await this.sprintsService.delete(id, tenantScope(user));
    if (!deleted) throw new NotFoundException('Sprint not found');
  }
}
