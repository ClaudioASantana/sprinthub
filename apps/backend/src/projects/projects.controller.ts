import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { tenantScope } from '../auth/tenant.util';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.findAll(tenantScope(user));
  }

  @Get('github/list')
  async listGithub(
    @Query('org') org?: string | string[],
    @Query('orgs') orgsCsv?: string,
  ) {
    try {
      const fromOrg = (Array.isArray(org) ? org : [org || ''])
        .flatMap((s) => String(s).split(','))
        .map((s) => s.trim())
        .filter(Boolean);
      const fromCsv = String(orgsCsv || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      return await this.projectsService.listGithubProjects([
        ...fromOrg,
        ...fromCsv,
      ]);
    } catch (e: any) {
      throw new BadRequestException(
        e?.message || 'Falha ao listar GitHub Projects',
      );
    }
  }

  @Post('github/import')
  async importGithub(
    @Body()
    body: {
      owner: string;
      number: number;
      id: string;
      title: string;
      url?: string;
      shortDescription?: string | null;
      teamId?: string;
      sync?: boolean;
    },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const companyId = user?.companyId;
    if (!companyId) {
      throw new BadRequestException('Usuário sem companyId no token.');
    }
    if (!body?.owner || !body?.number || !body?.id || !body?.title) {
      throw new BadRequestException(
        'Campos obrigatórios: owner, number, id, title',
      );
    }
    try {
      return await this.projectsService.importGithubProject({
        companyId,
        teamId: body.teamId,
        owner: body.owner,
        number: Number(body.number),
        id: body.id,
        title: body.title,
        url: body.url,
        shortDescription: body.shortDescription,
        sync: body.sync !== false,
      });
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Falha ao importar projeto');
    }
  }

  @Get(':id/stats')
  async getStats(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const stats = await this.projectsService.getStats(id, tenantScope(user));
    if (!stats) {
      throw new NotFoundException('Project not found');
    }
    return stats;
  }

  @Get(':id/velocity')
  async getVelocity(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const velocity = await this.projectsService.getVelocity(
      id,
      tenantScope(user),
    );
    if (!velocity) {
      throw new NotFoundException('Project not found');
    }
    return velocity;
  }

  @Post(':id/github/sync')
  async syncGithub(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      const result = await this.projectsService.syncGithubIssues(
        id,
        tenantScope(user),
      );
      if (!result) throw new NotFoundException('Project not found');
      return result;
    } catch (e: any) {
      if (e instanceof NotFoundException) throw e;
      throw new BadRequestException(e?.message || 'GitHub sync failed');
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const project = await this.projectsService.findOne(id, tenantScope(user));
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  @Post()
  create(
    @Body() body: { name: string; description?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!user?.companyId) {
      throw new BadRequestException('Usuário sem companyId no token.');
    }
    return this.projectsService.create({ ...body, companyId: user.companyId });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      description: string;
      githubOwner: string;
      githubRepo: string;
      githubProjectNumber: number | null;
    }>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const project = await this.projectsService.update(
      id,
      body as any,
      tenantScope(user),
    );
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const deleted = await this.projectsService.delete(id, tenantScope(user));
    if (!deleted) throw new NotFoundException('Project not found');
  }
}
