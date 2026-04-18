import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

@Controller('companies')
@UseGuards(SuperAdminGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Post()
  create(@Body() body: { name: string; cnpj: string; responsible: string; email: string }) {
    return this.companiesService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: Partial<{ name: string; cnpj: string; responsible: string; email: string; active: boolean }>,
  ) {
    return this.companiesService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.companiesService.delete(id);
  }
}
