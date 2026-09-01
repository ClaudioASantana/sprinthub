import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { ProjectsService } from './projects.service';

@Injectable()
export class GithubSyncCronService {
  private readonly logger = new Logger(GithubSyncCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Cron('0 */15 * * * *')
  async handleCron() {
    this.logger.log(
      'Iniciando sincronização automática de projetos do GitHub...',
    );
    try {
      const projectsToSync = await this.prisma.project.findMany({
        where: {
          OR: [
            { githubRepo: { not: null } },
            { githubProjectNumber: { not: null } },
          ],
        },
        select: { id: true, name: true, githubOwner: true },
      });

      this.logger.log(
        `Encontrados ${projectsToSync.length} projetos para sincronizar.`,
      );

      for (const project of projectsToSync) {
        try {
          this.logger.log(
            `Sincronizando projeto: ${project.name} (${project.id})`,
          );
          await this.projectsService.syncGithubIssues(project.id);
        } catch (error: any) {
          this.logger.error(
            `Falha ao sincronizar projeto ${project.name} (${project.id}): ${error.message}`,
          );
        }
      }
      this.logger.log('Sincronização automática concluída com sucesso.');
    } catch (error: any) {
      this.logger.error(
        'Erro na rotina de sincronização automática:',
        error.message,
      );
    }
  }
}
