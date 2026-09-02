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
  Req,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Req() req: { user?: { companyId?: string; profile?: string } }) {
    const companyId =
      req.user?.profile === 'super_admin' ? undefined : req.user?.companyId;
    return this.projectsService.findAll(companyId);
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
    @Req() req: { user?: { companyId?: string; profile?: string } },
  ) {
    const companyId = req.user?.companyId;
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

  @Get('company/:companyId')
  findByCompany(@Param('companyId') companyId: string) {
    return this.projectsService.findByCompany(companyId);
  }

  @Get(':id/stats')
  async getStats(
    @Param('id') id: string,
    @Req() req: { user?: { companyId?: string; profile?: string } },
  ) {
    const stats = await this.projectsService.getStats(id);
    if (!stats) {
      throw new NotFoundException('Project not found');
    }
    this.assertTenant(req.user, stats.companyId);
    return stats;
  }

  @Get(':id/velocity')
  async getVelocity(
    @Param('id') id: string,
    @Req() req: { user?: { companyId?: string; profile?: string } },
  ) {
    const velocity = await this.projectsService.getVelocity(id);
    if (!velocity) {
      throw new NotFoundException('Project not found');
    }
    this.assertTenant(req.user, velocity.companyId);
    return velocity;
  }

  @Post(':id/github/sync')
  async syncGithub(
    @Param('id') id: string,
    @Req() req: { user?: { companyId?: string; profile?: string } },
  ) {
    const project = await this.projectsService.findOne(id);
    if (!project) throw new NotFoundException('Project not found');
    this.assertTenant(req.user, project.companyId);
    try {
      return await this.projectsService.syncGithubIssues(id);
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'GitHub sync failed');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  create(
    @Body() body: { name: string; description?: string; companyId: string },
  ) {
    return this.projectsService.create(body);
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
    @Req() req: { user?: { companyId?: string; profile?: string } },
  ) {
    const project = await this.projectsService.findOne(id);
    if (!project) throw new NotFoundException('Project not found');
    this.assertTenant(req.user, project.companyId);
    return this.projectsService.update(id, body as any);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }

  private assertTenant(
    user: { companyId?: string; profile?: string } | undefined,
    companyId: string,
  ) {
    if (
      user?.profile !== 'super_admin' &&
      user?.companyId &&
      companyId !== user.companyId
    ) {
      throw new ForbiddenException('Project outside tenant scope');
    }
  }
}
