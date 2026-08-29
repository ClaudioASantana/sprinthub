import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @Query('projectId') projectId?: string,
    @Query('sprintId') sprintId?: string,
  ) {
    return this.tasksService.findAll({ projectId, sprintId });
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
  create(@Body() body: CreateTaskDto) {
    return this.tasksService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateTaskDto) {
    return this.tasksService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  addComment(
    @Param('id') taskId: string,
    @Body() body: { content: string; authorId?: string },
    @Req() req: { user?: { sub?: string; email?: string; companyId?: string } },
  ) {
    return this.tasksService.addComment(
      taskId,
      body.content,
      body.authorId || req.user?.sub,
      { email: req.user?.email, companyId: req.user?.companyId },
    );
  }

  @Get(':id/comments')
  getComments(@Param('id') taskId: string) {
    return this.tasksService.getComments(taskId);
  }
}
