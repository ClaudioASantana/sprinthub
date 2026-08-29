import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GithubSyncService } from './github-sync.service';

@Injectable()
export class GithubSyncCron {
  private readonly logger = new Logger(GithubSyncCron.name);

  constructor(private readonly githubSyncService: GithubSyncService) {}

  // Executa a cada 5 minutos
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.debug('Iniciando CRON job automático para sincronização do GitHub...');
    try {
      // Como não passamos um projectId específico, ele sincroniza todos os projetos
      const result = await this.githubSyncService.syncClosedPRs();
      
      if (result.totalAtualizados !== undefined) {
          this.logger.debug(`CRON job finalizado. Tasks atualizadas: ${result.totalAtualizados}`);
      }
    } catch (error) {
      this.logger.error('Erro ao executar o CRON job de sincronização do GitHub', error);
    }
  }
}
