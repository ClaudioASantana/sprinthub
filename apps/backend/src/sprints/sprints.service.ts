import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Sprint } from '@prisma/client';

@Injectable()
export class SprintsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string): Promise<Sprint[]> {
    return this.prisma.sprint.findMany({
      where: companyId ? { project: { companyId } } : undefined,
      include: { project: true, tasks: true },
    });
  }

  async findOne(id: string, companyId?: string): Promise<Sprint | null> {
    return this.prisma.sprint.findFirst({
      where: companyId ? { id, project: { companyId } } : { id },
      include: { project: true, tasks: true },
    });
  }

  async findByProject(
    projectId: string,
    companyId?: string,
  ): Promise<Sprint[]> {
    return this.prisma.sprint.findMany({
      where: companyId ? { projectId, project: { companyId } } : { projectId },
      include: { tasks: true },
    });
  }

  async create(data: Partial<Sprint>, companyId?: string): Promise<Sprint> {
    if (companyId) {
      if (!data.projectId) {
        throw new BadRequestException(
          'projectId é obrigatório para criar uma Sprint.',
        );
      }
      const project = await this.prisma.project.findFirst({
        where: { id: data.projectId, companyId },
      });
      if (!project) {
        throw new BadRequestException('Projeto fornecido não existe.');
      }
    }
    return this.prisma.sprint.create({ data: data as any });
  }

  async update(
    id: string,
    data: Partial<Sprint>,
    companyId?: string,
  ): Promise<Sprint | null> {
    const current = await this.findOne(id, companyId);
    if (!current) return null;

    if (data.status) {
      const currentStatus = current.status;
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
    return this.findOne(id, companyId);
  }

  async delete(id: string, companyId?: string): Promise<boolean> {
    const sprint = await this.prisma.sprint.findFirst({
      where: companyId ? { id, project: { companyId } } : { id },
      include: { _count: { select: { tasks: true } } },
    });

    if (!sprint) {
      return false;
    }

    if (sprint._count.tasks > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma Sprint que contenha tarefas. Remova as tarefas primeiro.',
      );
    }

    await this.prisma.sprint.delete({ where: { id } });
    return true;
  }

  /**
   * Burndown do sprint (Story 023).
   * Ideal: linha reta do total committed → 0 ao longo dos dias.
   * Real: remaining estimado por dia usando updatedAt das tasks done
   * (aproximação — sem histórico de status dedicado).
   */
  async getBurndown(sprintId: string, companyId?: string) {
    const sprint = await this.prisma.sprint.findFirst({
      where: companyId
        ? { id: sprintId, project: { companyId } }
        : { id: sprintId },
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
            storyPoints: true,
            updatedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!sprint) return null;

    const start = startOfDay(sprint.startDate);
    const end = startOfDay(sprint.endDate);
    const today = startOfDay(new Date());

    const days: Date[] = [];
    for (
      let d = new Date(start);
      d.getTime() <= end.getTime();
      d.setDate(d.getDate() + 1)
    ) {
      days.push(new Date(d));
    }
    if (days.length === 0) days.push(start);

    const committed = sprint.tasks.reduce(
      (sum, t) => sum + (t.storyPoints ?? 0),
      0,
    );
    // Tasks without points count as 1 unit for a usable chart when all null
    const useTaskCount = committed === 0;
    const totalUnits = useTaskCount ? sprint.tasks.length : committed;

    const points = days.map((day, index) => {
      const ideal =
        totalUnits === 0
          ? 0
          : Math.round(
              totalUnits * (1 - index / Math.max(days.length - 1, 1)) * 10,
            ) / 10;

      const dayEnd = endOfDay(day);
      let completedUnits = 0;
      for (const t of sprint.tasks) {
        if (t.status !== 'done') continue;
        const doneAt = t.updatedAt.getTime();
        if (doneAt <= dayEnd.getTime()) {
          completedUnits += useTaskCount ? 1 : (t.storyPoints ?? 0);
        }
      }

      const remaining = Math.max(0, totalUnits - completedUnits);
      const isFuture = day.getTime() > today.getTime();

      return {
        date: day.toISOString().slice(0, 10),
        ideal,
        remaining: isFuture ? null : remaining,
      };
    });

    const lastActual = [...points].reverse().find((p) => p.remaining != null);

    return {
      sprintId: sprint.id,
      sprintName: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      unit: useTaskCount ? 'tasks' : 'points',
      totalCommitted: totalUnits,
      remainingNow: lastActual?.remaining ?? totalUnits,
      points,
    };
  }
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
