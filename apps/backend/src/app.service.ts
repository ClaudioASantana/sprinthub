import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getStats(companyId?: string) {
    // Stats escopadas por empresa (usuários tenant)
    if (companyId) {
      const [projects, sprints, tasks, members] = await Promise.all([
        this.prisma.project.count({ where: { companyId, status: 'active' } }),
        this.prisma.sprint.count({ where: { project: { companyId } } }),
        this.prisma.task.count({ where: { project: { companyId } } }),
        this.prisma.user.count({ where: { companyId, active: true } }),
      ]);

      return { projects, sprints, tasks, members };
    }

    // Stats globais (super_admin sem companyId no JWT)
    const [companies, projects, sprints, tasks] = await Promise.all([
      this.prisma.company.count({ where: { active: true } }),
      this.prisma.project.count({ where: { status: 'active' } }),
      this.prisma.sprint.count(),
      this.prisma.task.count(),
    ]);

    return { companies, projects, sprints, tasks };
  }
}
