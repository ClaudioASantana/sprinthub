import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    projectId?: string;
    sprintId?: string;
  }): Promise<Task[]> {
    const where: any = {};

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters?.sprintId !== undefined) {
      if (filters.sprintId === 'null') {
        where.sprintId = null; // Filter backlog items
      } else {
        where.sprintId = filters.sprintId;
      }
    }

    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { sprint: true, assignee: true, _count: { select: { comments: true } } },
    });
  }

  async findOne(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: { sprint: true, assignee: true, comments: { include: { author: true }, orderBy: { createdAt: 'asc' } } },
    });
  }

  async findByProject(projectId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { projectId },
      include: { sprint: true, assignee: true, _count: { select: { comments: true } } },
    });
  }

  async findBySprint(sprintId: string): Promise<Task[]> {
    return this.prisma.task.findMany({ 
      where: { sprintId },
      include: { sprint: true, assignee: true, _count: { select: { comments: true } } },
    });
  }

  async create(data: Partial<Task>): Promise<Task> {
    if (data.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: data.projectId },
      });
      if (!project)
        throw new BadRequestException('Projeto fornecido não existe.');
    }
    if (data.sprintId) {
      const sprint = await this.prisma.sprint.findUnique({
        where: { id: data.sprintId },
      });
      if (!sprint)
        throw new BadRequestException('Sprint fornecida não existe.');
    }
    return this.prisma.task.create({ data: data as any });
  }

  async update(id: string, data: Partial<Task>): Promise<Task | null> {
    if (data.sprintId) {
      const sprint = await this.prisma.sprint.findUnique({
        where: { id: data.sprintId },
      });
      if (!sprint)
        throw new BadRequestException('Sprint fornecida não existe.');
    }
    if (data.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: data.projectId },
      });
      if (!project)
        throw new BadRequestException('Projeto fornecido não existe.');
    }
    await this.prisma.task.update({ where: { id }, data: data as any });
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }

  async addComment(
    taskId: string,
    content: string,
    authorId?: string,
    hints?: { email?: string; companyId?: string },
  ) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new BadRequestException('Tarefa fornecida não existe.');

    let user = authorId
      ? await this.prisma.user.findUnique({ where: { id: authorId } })
      : null;

    if (!user && hints?.email) {
      user = await this.prisma.user.findUnique({ where: { email: hints.email } });
    }

    if (!user && hints?.companyId) {
      user = await this.prisma.user.findFirst({
        where: { companyId: hints.companyId, active: true },
        orderBy: { createdAt: 'asc' },
      });
    }

    if (!user) {
      throw new BadRequestException(
        'Usuário autor não encontrado. Use um usuário do seed (ex.: po@demo.com) ou cadastre o usuário.',
      );
    }

    return this.prisma.comment.create({
      data: {
        content,
        taskId,
        authorId: user.id,
      },
      include: {
        author: true,
      },
    });
  }

  async getComments(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: true,
      },
    });
  }
}
