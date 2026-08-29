import { Module } from '@nestjs/common';
import { SyncStoriesService } from './sync-stories.service';
import { SyncStoriesController } from './sync-stories.controller';

@Module({
  providers: [SyncStoriesService],
  controllers: [SyncStoriesController],
})
export class SyncStoriesModule {}
