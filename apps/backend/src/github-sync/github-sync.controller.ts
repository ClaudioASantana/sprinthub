import { Controller, Post, Param } from '@nestjs/common';
import { GithubSyncService } from './github-sync.service';

@Controller('github-sync')
export class GithubSyncController {
  constructor(private readonly githubSyncService: GithubSyncService) {}

  @Post('run/:projectId')
  async runSync(@Param('projectId') projectId: string) {
    const result = await this.githubSyncService.syncClosedPRs(projectId);
    return { success: true, result };
  }

  @Post('run-all')
  async runSyncAll() {
    const result = await this.githubSyncService.syncClosedPRs();
    return { success: true, result };
  }
}
