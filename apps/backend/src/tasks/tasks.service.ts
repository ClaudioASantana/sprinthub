import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    filters?: {
      projectId?: string;
      sprintId?: string;
    },
    companyId?: string,
  ): Promise<Task[]> {
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

    if (companyId) {
      where.project = { companyId };
    }

    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        sprint: true,
        assignee: true,
        _count: { select: { comments: true } },
      },
    });
  }

  async findOne(id: string, companyId?: string): Promise<Task | null> {
    return this.prisma.task.findFirst({
      where: companyId ? { id, project: { companyId } } : { id },
      include: {
        sprint: true,
        assignee: true,
        comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async findByProject(projectId: string, companyId?: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: companyId ? { projectId, project: { companyId } } : { projectId },
      include: {
        sprint: true,
        assignee: true,
        _count: { select: { comments: true } },
      },
    });
  }

  async findBySprint(sprintId: string, companyId?: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: companyId ? { sprintId, project: { companyId } } : { sprintId },
      include: {
        sprint: true,
        assignee: true,
        _count: { select: { comments: true } },
      },
    });
  }

  /**
   * Valida que a sprint existe e pertence ao mesmo projeto da tarefa. O banco
   * não tem constraint ligando Task.projectId a Sprint.projectId, então sem
   * esta checagem a tarefa acaba numa sprint de outro projeto (e de outra
   * empresa), quebrando o isolamento por tenant.
   */
  private async assertSprintBelongsToProject(
    sprintId: string,
    projectId: string,
  ): Promise<void> {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });
    if (!sprint) throw new BadRequestException('Sprint fornecida não existe.');
    if (sprint.projectId !== projectId) {
      throw new BadRequestException(
        'A sprint fornecida pertence a outro projeto.',
      );
    }
  }

  async create(data: Partial<Task>, companyId?: string): Promise<Task> {
    if (data.projectId) {
      const project = companyId
        ? await this.prisma.project.findFirst({
            where: { id: data.projectId, companyId },
          })
        : await this.prisma.project.findUnique({
            where: { id: data.projectId },
          });
      if (!project)
        throw new BadRequestException('Projeto fornecido não existe.');
    }
    if (data.sprintId) {
      if (!data.projectId) {
        throw new BadRequestException(
          'projectId é obrigatório para associar a tarefa a uma sprint.',
        );
      }
      await this.assertSprintBelongsToProject(data.sprintId, data.projectId);
    }
    return this.prisma.task.create({ data: data as any });
  }

  async update(
    id: string,
    data: Partial<Task>,
    companyId?: string,
  ): Promise<Task | null> {
    const current = await this.findOne(id, companyId);
    if (!current) return null;

    if (data.projectId) {
      const project = companyId
        ? await this.prisma.project.findFirst({
            where: { id: data.projectId, companyId },
          })
        : await this.prisma.project.findUnique({
            where: { id: data.projectId },
          });
      if (!project)
        throw new BadRequestException('Projeto fornecido não existe.');
    }
    if (data.sprintId) {
      // O projeto de destino é o novo (se veio no patch) ou o atual da tarefa.
      await this.assertSprintBelongsToProject(
        data.sprintId,
        data.projectId ?? current.projectId,
      );
    }
    await this.prisma.task.update({ where: { id }, data: data as any });
    return this.findOne(id, companyId);
  }

  async delete(id: string, companyId?: string): Promise<boolean> {
    const current = await this.findOne(id, companyId);
    if (!current) return false;
    await this.prisma.task.delete({ where: { id } });
    return true;
  }

  async addComment(
    taskId: string,
    content: string,
    authorId?: string,
    hints?: { email?: string; companyId?: string },
  ) {
    const task = await this.findOne(taskId, hints?.companyId);
    if (!task) throw new BadRequestException('Tarefa fornecida não existe.');

    let user = authorId
      ? await this.prisma.user.findUnique({ where: { id: authorId } })
      : null;

    if (!user && hints?.email) {
      user = await this.prisma.user.findUnique({
        where: { email: hints.email },
      });
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

  async getComments(taskId: string, companyId?: string) {
    const task = await this.findOne(taskId, companyId);
    if (!task) return null;
    return this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: true,
      },
    });
  }
}
