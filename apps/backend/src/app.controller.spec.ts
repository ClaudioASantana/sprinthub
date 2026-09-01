import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        // Stub: getHello não toca no banco, e o PrismaService real abriria
        // conexão com o Postgres só para montar o módulo de teste.
        { provide: PrismaService, useValue: {} },
        // O JwtAuthGuard protege GET /stats e é instanciado ao montar o módulo,
        // então precisa do JwtService mesmo que este teste não passe por ele.
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
