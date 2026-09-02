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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { tenantScope } from '../auth/tenant.util';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @Query('projectId') projectId: string | undefined,
    @Query('sprintId') sprintId: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasksService.findAll({ projectId, sprintId }, tenantScope(user));
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const task = await this.tasksService.findOne(id, tenantScope(user));
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  @Get('/project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasksService.findByProject(projectId, tenantScope(user));
  }

  @Get('/sprint/:sprintId')
  findBySprint(
    @Param('sprintId') sprintId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasksService.findBySprint(sprintId, tenantScope(user));
  }

  @Post()
  create(@Body() body: CreateTaskDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.create(body, tenantScope(user));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const task = await this.tasksService.update(id, body, tenantScope(user));
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const deleted = await this.tasksService.delete(id, tenantScope(user));
    if (!deleted) throw new NotFoundException('Task not found');
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') taskId: string,
    @Body() body: { content: string; authorId?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const companyId = tenantScope(user);
    const task = await this.tasksService.findOne(taskId, companyId);
    if (!task) throw new NotFoundException('Task not found');
    return this.tasksService.addComment(
      taskId,
      body.content,
      body.authorId || user?.sub,
      { email: user?.email, companyId },
    );
  }

  @Get(':id/comments')
  async getComments(
    @Param('id') taskId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const comments = await this.tasksService.getComments(
      taskId,
      tenantScope(user),
    );
    if (comments === null) throw new NotFoundException('Task not found');
    return comments;
  }
}
