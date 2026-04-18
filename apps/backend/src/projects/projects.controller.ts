import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Get('/company/:companyId')
  findByCompany(@Param('companyId') companyId: string) {
    return this.projectsService.findByCompany(companyId);
  }

  @Post()
  create(
    @Body() body: { name: string; description?: string; companyId: string },
  ) {
    return this.projectsService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<{ name: string; description: string }>,
  ) {
    return this.projectsService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }
}
