import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SprintsService } from './sprints.service';

@Controller('sprints')
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Get()
  findAll() {
    return this.sprintsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sprintsService.findOne(id);
  }

  @Get('/project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.sprintsService.findByProject(projectId);
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      goal?: string;
      startDate?: string;
      endDate?: string;
      projectId: string;
    },
  ) {
    return this.sprintsService.create({
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
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
