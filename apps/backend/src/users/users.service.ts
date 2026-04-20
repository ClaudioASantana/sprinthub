import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    if (!companyId) return [];
    return this.prisma.user.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    name: string;
    email: string;
    role: string;
    companyId: string;
  }) {
    // Basic verification - checking if email exists in this company
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error('Usuário já cadastrado com este e-mail.');
    }

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role || 'member',
        companyId: data.companyId,
      },
    });
  }
}
