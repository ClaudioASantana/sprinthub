import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { createHash } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { AuthService } from '../src/auth/auth.service';

// Story 032: refresh token é opaco e guardado (hash) no banco — dá pra
// revogar/rotacionar, ao contrário de um JWT stateless. Aqui validamos a
// rotação (token velho morre ao gerar um novo) e os casos de rejeição.
describe('POST /auth/refresh (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let authService: AuthService;

  const seed = { companyId: '', teamId: '', userId: '' };

  function hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    authService = moduleFixture.get(AuthService);

    const company = await prisma.company.create({
      data: {
        name: 'Empresa Refresh Token Test',
        cnpj: `refresh-test-${Date.now()}`,
        responsible: 'Teste',
        email: `refresh-token-company-${Date.now()}@test.com`,
      },
    });
    const team = await prisma.team.create({
      data: { name: 'Team Refresh Token Test', companyId: company.id },
    });
    const user = await prisma.user.create({
      data: {
        email: `refresh-token-test-${Date.now()}@test.com`,
        name: 'Refresh Token Test User',
        companyId: company.id,
        teamId: team.id,
      },
    });

    seed.companyId = company.id;
    seed.teamId = team.id;
    seed.userId = user.id;
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({ where: { userId: seed.userId } });
    await prisma.user.deleteMany({ where: { id: seed.userId } });
    await prisma.team.deleteMany({ where: { id: seed.teamId } });
    await prisma.company.deleteMany({ where: { id: seed.companyId } });
    await app.close();
  });

  it('refresh válido gera par novo e revoga o antigo (reusar o antigo -> 401)', async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: seed.userId } });
    const original = await authService.issueTokenPair(user);

    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: original.refresh_token })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
    expect(res.body.refresh_token).not.toBe(original.refresh_token);
    expect(res.body.access_token).not.toBe(original.access_token);

    // token antigo já foi rotacionado (revogado) — reusar deve falhar
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: original.refresh_token })
      .expect(401);
  });

  it('refresh token expirado -> 401', async () => {
    const raw = 'expired-raw-token-for-test';
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(raw),
        userId: seed.userId,
        expiresAt: new Date(Date.now() - 1000), // já expirado
      },
    });

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: raw })
      .expect(401);
  });

  it('refresh token revogado -> 401', async () => {
    const raw = 'revoked-raw-token-for-test';
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(raw),
        userId: seed.userId,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        revokedAt: new Date(),
      },
    });

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: raw })
      .expect(401);
  });

  it('sem refresh_token no body -> 401', async () => {
    await request(app.getHttpServer()).post('/auth/refresh').send({}).expect(401);
  });
});
