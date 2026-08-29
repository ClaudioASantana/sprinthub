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

@Controller('sprints')
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    if (projectId) {
      return this.sprintsService.findByProject(projectId);
    }
    return this.sprintsService.findAll();
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.sprintsService.findByProject(projectId);
  }

  @Get(':id/burndown')
  async getBurndown(@Param('id') id: string) {
    const data = await this.sprintsService.getBurndown(id);
    if (!data) throw new NotFoundException('Sprint not found');
    return data;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sprintsService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateSprintDto) {
    return this.sprintsService.create({
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    } as any);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateSprintDto) {
    const data: any = { ...body };
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);
    return this.sprintsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.sprintsService.delete(id);
  }
}
