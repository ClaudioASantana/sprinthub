import { Controller, Post } from '@nestjs/common';
import { SyncStoriesService } from './sync-stories.service';

@Controller('sync-stories')
export class SyncStoriesController {
  constructor(private readonly syncStoriesService: SyncStoriesService) {}

  @Post('run')
  async runSync() {
    const result = await this.syncStoriesService.syncFromMarkdown();
    return { success: true, result };
  }
}
