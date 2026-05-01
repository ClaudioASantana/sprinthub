import { Injectable, BadRequestException } from '@nestjs/common';
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
    if (data.status) {
      const currentSprint = await this.findOne(id);
      if (!currentSprint) {
        throw new BadRequestException('Sprint não encontrada.');
      }
      const currentStatus = currentSprint.status;
      const newStatus = data.status;

      // planning -> active -> completed/cancelled
      if (currentStatus === 'planning' && newStatus === 'completed') {
        throw new BadRequestException(
          'Não é possível concluir uma Sprint que não foi iniciada (active).',
        );
      }
      if (currentStatus === 'completed' || currentStatus === 'cancelled') {
        throw new BadRequestException(
          'Não é possível alterar o status de uma Sprint já finalizada ou cancelada.',
        );
      }
    }

    await this.prisma.sprint.update({ where: { id }, data: data as any });
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id },
      include: { _count: { select: { tasks: true } } },
    });

    if (!sprint) {
      throw new BadRequestException('Sprint não encontrada.');
    }

    if (sprint._count.tasks > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma Sprint que contenha tarefas. Remova as tarefas primeiro.',
      );
    }

    await this.prisma.sprint.delete({ where: { id } });
  }
}
