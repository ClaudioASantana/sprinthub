import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubSyncService {
  private readonly logger = new Logger(GithubSyncService.name);
  private octokit: Octokit;

  constructor(private prisma: PrismaService) {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    this.octokit = new Octokit({ auth: token });
    if (!token) {
      this.logger.warn(
        'GITHUB_TOKEN não configurado. As requisições podem sofrer rate limit.',
      );
    }
  }

  async syncClosedPRs(projectId?: string) {
    this.logger.log('Iniciando sincronização com GitHub...');

    // Filtra por um projeto específico ou todos que tenham config do github
    const whereClause = projectId
      ? { id: projectId, githubOwner: { not: null }, githubRepo: { not: null } }
      : { githubOwner: { not: null }, githubRepo: { not: null } };

    const projects = await this.prisma.project.findMany({
      where: whereClause as any,
    });

    if (projects.length === 0) {
      this.logger.log(
        'Nenhum projeto configurado para sincronização com GitHub.',
      );
      return { message: 'Nenhum projeto configurado.' };
    }

    let totalUpdated = 0;

    for (const project of projects) {
      this.logger.log(
        `Consultando PRs para ${project.githubOwner}/${project.githubRepo}`,
      );

      try {
        const response = await this.octokit.pulls.list({
          owner: project.githubOwner!,
          repo: project.githubRepo!,
          state: 'closed',
          sort: 'updated',
          direction: 'desc',
          per_page: 50,
        });

        const mergedPrs = response.data.filter((pr) => pr.merged_at !== null);

        for (const pr of mergedPrs) {
          const content = `${pr.title} ${pr.body || ''}`;

          // Regex para encontrar arquivos .md mencionados (ex: Fixes 001-authenticar-super-admin.md)
          const regex = /([a-zA-Z0-9-]+\.md)/g;
          const matches = content.match(regex);

          if (matches) {
            for (const filename of matches) {
              const task = await this.prisma.task.findFirst({
                where: {
                  projectId: project.id,
                  githubProjectItemId: filename, // Onde guardamos a referência do arquivo Markdown
                },
              });

              if (task && task.status !== 'done') {
                await this.prisma.task.update({
                  where: { id: task.id },
                  data: { status: 'done' },
                });
                this.logger.log(
                  `Task ${filename} (ID: ${task.id}) marcada como done através do PR #${pr.number}`,
                );
                totalUpdated++;
              }
            }
          }
        }
      } catch (error) {
        this.logger.error(
          `Erro ao buscar dados do repositório ${project.githubOwner}/${project.githubRepo}`,
          error,
        );
      }
    }

    return { totalAtualizados: totalUpdated };
  }
}
