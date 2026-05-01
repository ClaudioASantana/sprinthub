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
      include: { sprint: true, assignee: true },
    });
  }

  async findOne(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: { sprint: true, assignee: true },
    });
  }

  async findByProject(projectId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { projectId },
      include: { sprint: true, assignee: true },
    });
  }

  async findBySprint(sprintId: string): Promise<Task[]> {
    return this.prisma.task.findMany({ where: { sprintId } });
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
}
