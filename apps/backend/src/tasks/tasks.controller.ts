import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Get('/project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.tasksService.findByProject(projectId);
  }

  @Get('/sprint/:sprintId')
  findBySprint(@Param('sprintId') sprintId: string) {
    return this.tasksService.findBySprint(sprintId);
  }

  @Post()
  create(@Body() body: any) {
    return this.tasksService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }
}
