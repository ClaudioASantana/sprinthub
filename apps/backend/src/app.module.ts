import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { PrismaModule } from './prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { ProjectsModule } from './projects/projects.module';
import { SprintsModule } from './sprints/sprints.module';
import { TasksModule } from './tasks/tasks.module';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';
import { SyncStoriesModule } from './sync-stories/sync-stories.module';
import { GithubSyncModule } from './github-sync/github-sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    ProjectsModule,
    SprintsModule,
    TasksModule,
    TeamsModule,
    UsersModule,
    SyncStoriesModule,
    GithubSyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}