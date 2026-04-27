import { Injectable, BadRequestException } from '@nestjs/common';
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

  async create(
    data: Prisma.CompanyCreateInput & {
      ownerEmail?: string;
      ownerName?: string;
    },
  ): Promise<Company> {
    const { ownerEmail, ownerName, ...companyData } = data;

    try {
      // Transação para criar a Empresa e o Titular simultaneamente
      return await this.prisma.$transaction(async (tx) => {
        const company = await tx.company.create({ data: companyData });

        if (ownerEmail && ownerName) {
          await tx.user.create({
            data: {
              email: ownerEmail,
              name: ownerName,
              role: 'admin',
              companyId: company.id,
            },
          });
        }

        return company;
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const fields = error.meta?.target ? (Array.isArray(error.meta.target) ? error.meta.target.join(', ') : error.meta.target) : 'desconhecido';
        throw new BadRequestException(`Registro duplicado! Já existe um registro com este(s) dado(s): ${fields}. Por favor, use outro CNPJ ou E-mail.`);
      }
      throw error;
    }
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
