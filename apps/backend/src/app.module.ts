import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaService } from './prisma.service';
import { PrismaModule } from './prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
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
    // Defesa geral contra abuso; os endpoints de auth (Story 032) aplicam
    // um limite mais apertado por cima disso via @Throttle().
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
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
  providers: [
    AppService,
    // Story 030: toda rota nasce fechada por padrão; @Public() é a exceção
    // explícita. Antes disso, uma rota só ficava protegida se alguém
    // lembrasse de anotar @UseGuards(JwtAuthGuard).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Story 032: rate limit global — combina com o limite mais apertado
    // aplicado via @Throttle() nos endpoints de autenticação.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
