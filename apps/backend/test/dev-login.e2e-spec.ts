import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

// Story 032: dev-login não pode mais ser uma chave-mestra — só existe fora de
// produção, nunca cria usuário/empresa, e role/profile/companyId vêm sempre
// do registro no banco, nunca do body da requisição.
describe('POST /auth/dev-login (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const seed = { companyId: '', teamId: '', userId: '' };
  const email = `dev-login-test-${Date.now()}@test.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get(PrismaService);

    const company = await prisma.company.create({
      data: {
        name: 'Empresa Dev Login Test',
        cnpj: `dev-login-test-${Date.now()}`,
        responsible: 'Teste',
        email: `dev-login-company-${Date.now()}@test.com`,
      },
    });
    const team = await prisma.team.create({
      data: { name: 'Team Dev Login Test', companyId: company.id },
    });
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Dev Login Test User',
        role: 'member',
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

  it('em produção -> 404 (a rota nem existe)', async () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      await request(app.getHttpServer())
        .post('/auth/dev-login')
        .send({ email })
        .expect(404);
    } finally {
      process.env.NODE_ENV = original;
    }
  });

  it('e-mail que não existe no banco -> 401, sem criar nada', async () => {
    const inexistente = `nao-existe-${Date.now()}@test.com`;

    await request(app.getHttpServer())
      .post('/auth/dev-login')
      .send({ email: inexistente })
      .expect(401);

    const created = await prisma.user.findUnique({ where: { email: inexistente } });
    expect(created).toBeNull();
  });

  it('e-mail existente -> 200, role/profile/companyId vêm do banco mesmo se o body mandar outro role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/dev-login')
      .send({ email, role: 'super_admin' }) // tentativa de forjar o role
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
    expect(res.body.user.role).toBe('member'); // ignora o 'super_admin' do body
    expect(res.body.user.profile).toBe('user');
    expect(res.body.user.companyId).toBe(seed.companyId);
  });
});
