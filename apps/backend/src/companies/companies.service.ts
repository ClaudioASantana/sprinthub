import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Company, Prisma } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Company[]> {
    return this.prisma.company.findMany({ include: { projects: true } });
  }

  async findOne(id: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { id },
      include: { projects: true },
    });
  }

  async create(data: Prisma.CompanyCreateInput): Promise<Company> {
    return this.prisma.company.create({ data });
  }

  async update(
    id: string,
    data: Prisma.CompanyUpdateInput,
  ): Promise<Company | null> {
    return this.prisma.company.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.delete({ where: { id } });
  }
}
