import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Task[]> {
    return this.prisma.task.findMany({ include: { sprint: true } });
  }

  async findOne(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: { sprint: true },
    });
  }

  async findByProject(projectId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { projectId },
      include: { sprint: true },
    });
  }

  async findBySprint(sprintId: string): Promise<Task[]> {
    return this.prisma.task.findMany({ where: { sprintId } });
  }

  async create(data: Partial<Task>): Promise<Task> {
    return this.prisma.task.create({ data: data as any });
  }

  async update(id: string, data: Partial<Task>): Promise<Task | null> {
    await this.prisma.task.update({ where: { id }, data: data as any });
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }
}
