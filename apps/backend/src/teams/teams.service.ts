import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Team } from '@prisma/client';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId?: string) {
    const where = companyId ? { companyId, active: true } : { active: true };
    return this.prisma.team.findMany({
      where,
      include: { members: true },
    });
  }

  async findOne(id: string, companyId?: string): Promise<Team | null> {
    return this.prisma.team.findFirst({
      where: companyId ? { id, companyId } : { id },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    companyId: string;
  }): Promise<Team> {
    return this.prisma.team.create({ data: { ...data, active: true } });
  }

  async update(
    id: string,
    data: { name?: string; description?: string; active?: boolean },
    companyId?: string,
  ): Promise<Team | null> {
    const current = await this.findOne(id, companyId);
    if (!current) return null;
    return this.prisma.team.update({ where: { id }, data });
  }

  async remove(id: string, companyId?: string): Promise<boolean> {
    const current = await this.findOne(id, companyId);
    if (!current) return false;
    await this.prisma.team.update({ where: { id }, data: { active: false } });
    return true;
  }

  async addMember(teamId: string, userId: string, companyId?: string) {
    const team = await this.findOne(teamId, companyId);
    if (!team) return null;
    const user = await this.prisma.user.findFirst({
      where: companyId ? { id: userId, companyId } : { id: userId },
    });
    if (!user) return null;
    return this.prisma.user.update({
      where: { id: userId },
      data: { teamId },
    });
  }

  async removeMember(teamId: string, userId: string, companyId?: string) {
    const team = await this.findOne(teamId, companyId);
    if (!team) return null;
    const user = await this.prisma.user.findFirst({
      where: companyId ? { id: userId, companyId } : { id: userId },
    });
    if (!user) return null;
    return this.prisma.user.update({
      where: { id: userId },
      data: { teamId: null },
    });
  }
}
