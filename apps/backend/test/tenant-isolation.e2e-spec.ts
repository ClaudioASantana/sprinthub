import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

// Story 031: um token válido da empresa A nunca pode ler/editar/apagar um
// recurso da empresa B por id (deve dar 404, nunca 403 — 403 confirmaria que
// o recurso existe), e listagens da empresa A nunca podem incluir itens da B.
describe('Isolamento de tenant (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tokenA: string;
  let tokenB: string;

  const seed = {
    companyA: { id: '', teamId: '', projectId: '', sprintId: '', taskId: '', userId: '', commentId: '' },
    companyB: { id: '', teamId: '', projectId: '', sprintId: '', taskId: '', userId: '', commentId: '' },
  };

  async function seedCompany(suffix: 'A' | 'B') {
    const company = await prisma.company.create({
      data: {
        name: `Empresa Tenant Test ${suffix}`,
        cnpj: `tenant-test-${suffix}-${Date.now()}`,
        responsible: 'Teste',
        email: `tenant-${suffix.toLowerCase()}@test.com`,
      },
    });
    const team = await prisma.team.create({
      data: { name: `Team ${suffix}`, companyId: company.id },
    });
    const user = await prisma.user.create({
      data: {
        email: `user-${suffix.toLowerCase()}-${Date.now()}@test.com`,
        name: `User ${suffix}`,
        companyId: company.id,
        teamId: team.id,
      },
    });
    const project = await prisma.project.create({
      data: { name: `Project ${suffix}`, companyId: company.id, teamId: team.id },
    });
    const sprint = await prisma.sprint.create({
      data: {
        name: `Sprint ${suffix}`,
        projectId: project.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    const task = await prisma.task.create({
      data: { title: `Task ${suffix}`, projectId: project.id, sprintId: sprint.id },
    });
    const comment = await prisma.comment.create({
      data: { content: `Comment ${suffix}`, taskId: task.id, authorId: user.id },
    });

    return {
      id: company.id,
      teamId: team.id,
      userId: user.id,
      projectId: project.id,
      sprintId: sprint.id,
      taskId: task.id,
      commentId: comment.id,
    };
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    jwtService = moduleFixture.get(JwtService);

    Object.assign(seed.companyA, await seedCompany('A'));
    Object.assign(seed.companyB, await seedCompany('B'));

    tokenA = jwtService.sign({
      sub: seed.companyA.userId,
      email: 'user-a@test.com',
      profile: 'user',
      companyId: seed.companyA.id,
    });
    tokenB = jwtService.sign({
      sub: seed.companyB.userId,
      email: 'user-b@test.com',
      profile: 'user',
      companyId: seed.companyB.id,
    });
  });

  afterAll(async () => {
    // Ordem explícita em vez de confiar em cascade: mais robusto a mudanças
    // de schema e evita violação de FK entre User <-> Comment.
    for (const c of [seed.companyA, seed.companyB]) {
      await prisma.comment.deleteMany({ where: { authorId: c.userId } });
      await prisma.task.deleteMany({ where: { projectId: c.projectId } });
      await prisma.sprint.deleteMany({ where: { projectId: c.projectId } });
      await prisma.project.deleteMany({ where: { id: c.projectId } });
      await prisma.user.deleteMany({ where: { id: c.userId } });
      await prisma.team.deleteMany({ where: { id: c.teamId } });
      await prisma.company.deleteMany({ where: { id: c.id } });
    }
    await app.close();
  });

  function authed(token: string) {
    return {
      get: (url: string) =>
        request(app.getHttpServer()).get(url).set('Authorization', `Bearer ${token}`),
      post: (url: string) =>
        request(app.getHttpServer()).post(url).set('Authorization', `Bearer ${token}`),
      patch: (url: string) =>
        request(app.getHttpServer()).patch(url).set('Authorization', `Bearer ${token}`),
      delete: (url: string) =>
        request(app.getHttpServer()).delete(url).set('Authorization', `Bearer ${token}`),
    };
  }

  describe('projects', () => {
    it('GET /projects/:id de outra empresa -> 404', () => {
      return authed(tokenA).get(`/projects/${seed.companyB.projectId}`).expect(404);
    });
    it('PATCH /projects/:id de outra empresa -> 404', () => {
      return authed(tokenA)
        .patch(`/projects/${seed.companyB.projectId}`)
        .send({ name: 'hacked' })
        .expect(404);
    });
    it('DELETE /projects/:id de outra empresa -> 404', () => {
      return authed(tokenA).delete(`/projects/${seed.companyB.projectId}`).expect(404);
    });
    it('GET /projects não lista projetos de outra empresa', async () => {
      const res = await authed(tokenA).get('/projects').expect(200);
      const ids = res.body.map((p: any) => p.id);
      expect(ids).not.toContain(seed.companyB.projectId);
    });
  });

  describe('sprints', () => {
    it('GET /sprints/:id de outra empresa -> 404', () => {
      return authed(tokenA).get(`/sprints/${seed.companyB.sprintId}`).expect(404);
    });
    it('PATCH /sprints/:id de outra empresa -> 404', () => {
      return authed(tokenA)
        .patch(`/sprints/${seed.companyB.sprintId}`)
        .send({ goal: 'hacked' })
        .expect(404);
    });
    it('DELETE /sprints/:id de outra empresa -> 404', () => {
      return authed(tokenA).delete(`/sprints/${seed.companyB.sprintId}`).expect(404);
    });
    it('GET /sprints/:id/burndown de outra empresa -> 404', () => {
      return authed(tokenA).get(`/sprints/${seed.companyB.sprintId}/burndown`).expect(404);
    });
    it('GET /sprints não lista sprints de outra empresa', async () => {
      const res = await authed(tokenA).get('/sprints').expect(200);
      const ids = res.body.map((s: any) => s.id);
      expect(ids).not.toContain(seed.companyB.sprintId);
    });
  });

  describe('tasks', () => {
    it('GET /tasks/:id de outra empresa -> 404', () => {
      return authed(tokenA).get(`/tasks/${seed.companyB.taskId}`).expect(404);
    });
    it('PATCH /tasks/:id de outra empresa -> 404', () => {
      return authed(tokenA)
        .patch(`/tasks/${seed.companyB.taskId}`)
        .send({ title: 'hacked' })
        .expect(404);
    });
    it('DELETE /tasks/:id de outra empresa -> 404', () => {
      return authed(tokenA).delete(`/tasks/${seed.companyB.taskId}`).expect(404);
    });
    it('POST /tasks/:id/comments em task de outra empresa -> 404', () => {
      return authed(tokenA)
        .post(`/tasks/${seed.companyB.taskId}/comments`)
        .send({ content: 'hacked' })
        .expect(404);
    });
    it('GET /tasks/:id/comments de outra empresa -> 404', () => {
      return authed(tokenA).get(`/tasks/${seed.companyB.taskId}/comments`).expect(404);
    });
    it('GET /tasks não lista tasks de outra empresa', async () => {
      const res = await authed(tokenA).get('/tasks').expect(200);
      const ids = res.body.map((t: any) => t.id);
      expect(ids).not.toContain(seed.companyB.taskId);
    });
  });

  describe('teams', () => {
    it('GET /teams/:id de outra empresa -> 404', () => {
      return authed(tokenA).get(`/teams/${seed.companyB.teamId}`).expect(404);
    });
    it('PATCH /teams/:id de outra empresa -> 404', () => {
      return authed(tokenA)
        .patch(`/teams/${seed.companyB.teamId}`)
        .send({ name: 'hacked' })
        .expect(404);
    });
    it('DELETE /teams/:id de outra empresa -> 404', () => {
      return authed(tokenA).delete(`/teams/${seed.companyB.teamId}`).expect(404);
    });
    it('POST /teams/:id/members em time de outra empresa -> 404', () => {
      return authed(tokenA)
        .post(`/teams/${seed.companyB.teamId}/members`)
        .send({ userId: seed.companyA.userId })
        .expect(404);
    });
    it('GET /teams não lista times de outra empresa', async () => {
      const res = await authed(tokenA).get('/teams').expect(200);
      const ids = res.body.map((t: any) => t.id);
      expect(ids).not.toContain(seed.companyB.teamId);
    });
  });

  describe('users', () => {
    it('GET /users não lista usuários de outra empresa', async () => {
      const res = await authed(tokenA).get('/users').expect(200);
      const ids = res.body.map((u: any) => u.id);
      expect(ids).not.toContain(seed.companyB.userId);
    });

    it('POST /users ignora companyId do body e usa o do token', async () => {
      const res = await authed(tokenA)
        .post('/users')
        .send({
          name: 'Forjado',
          email: `forjado-${Date.now()}@test.com`,
          role: 'member',
          companyId: seed.companyB.id, // tentativa de forjar outra empresa
        })
        .expect(201);

      expect(res.body.companyId).toBe(seed.companyA.id);

      await prisma.user.deleteMany({ where: { id: res.body.id } });
    });
  });
});
