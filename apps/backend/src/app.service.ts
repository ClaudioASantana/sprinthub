import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getStats() {
    const [companies, projects, sprints, tasks] = await Promise.all([
      this.prisma.company.count({ where: { active: true } }),
      this.prisma.project.count({ where: { status: 'active' } }),
      this.prisma.sprint.count(),
      this.prisma.task.count(),
    ]);

    return {
      companies,
      projects,
      sprints,
      tasks,
    };
  }
}
