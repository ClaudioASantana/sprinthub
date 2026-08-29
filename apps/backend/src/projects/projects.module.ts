import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { AuthModule } from '../auth/auth.module';
import { GithubSyncCronService } from './github-sync.cron';

@Module({
  imports: [AuthModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, GithubSyncCronService],
  exports: [ProjectsService],
})
export class ProjectsModule {}