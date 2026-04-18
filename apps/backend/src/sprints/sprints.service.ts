import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Sprint } from '@prisma/client';

@Injectable()
export class SprintsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Sprint[]> {
    return this.prisma.sprint.findMany({
      include: { project: true, tasks: true },
    });
  }

  async findOne(id: string): Promise<Sprint | null> {
    return this.prisma.sprint.findUnique({
      where: { id },
      include: { project: true, tasks: true },
    });
  }

  async findByProject(projectId: string): Promise<Sprint[]> {
    return this.prisma.sprint.findMany({
      where: { projectId },
      include: { tasks: true },
    });
  }

  async create(data: Partial<Sprint>): Promise<Sprint> {
    return this.prisma.sprint.create({ data: data as any });
  }

  async update(id: string, data: Partial<Sprint>): Promise<Sprint | null> {
    await this.prisma.sprint.update({ where: { id }, data: data as any });
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.sprint.delete({ where: { id } });
  }
}
