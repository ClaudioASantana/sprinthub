import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: string): Promise<Team> {
    const team = await this.prisma.team.findUnique({ where: { id } });
    if (!team) throw new NotFoundException(`Team ${id} not found`);
    return team;
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
  ): Promise<Team> {
    return this.prisma.team.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.team.update({ where: { id }, data: { active: false } });
  }

  async addMember(teamId: string, userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { teamId },
    });
  }

  async removeMember(teamId: string, userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { teamId: null },
    });
  }
}
