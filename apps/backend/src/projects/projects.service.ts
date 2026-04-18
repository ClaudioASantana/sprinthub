import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Project } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Project[]> {
    return this.prisma.project.findMany({
      include: { company: true, sprints: true },
    });
  }

  async findOne(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { id },
      include: { company: true, sprints: true },
    });
  }

  async findByCompany(companyId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { companyId },
      include: { sprints: true },
    });
  }

  async create(data: Partial<Project>): Promise<Project> {
    return this.prisma.project.create({ data: data as any });
  }

  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    await this.prisma.project.update({ where: { id }, data: data as any });
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }
}
