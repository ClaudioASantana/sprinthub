import { Module } from '@nestjs/common';
import { GithubSyncService } from './github-sync.service';
import { GithubSyncController } from './github-sync.controller';
import { GithubSyncCron } from './github-sync.cron';

@Module({
  providers: [GithubSyncService, GithubSyncCron],
  controllers: [GithubSyncController],
})
export class GithubSyncModule {}
