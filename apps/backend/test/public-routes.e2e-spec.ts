import { ExecutionContext } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import {
  DiscoveryModule,
  DiscoveryService,
  MetadataScanner,
  Reflector,
} from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { IS_PUBLIC_KEY } from '../src/auth/decorators/public.decorator';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

// Este teste não sobe um servidor HTTP: ele resolve o grafo de DI da
// AppModule (sem `app.init()`, então o PrismaService nunca chega a
// `$connect()`) e chama o JwtAuthGuard de verdade para cada rota registrada,
// simulando uma requisição sem header de Authorization.
//
// É o que garante o último critério de aceite da Story 030: se uma rota nova
// nascer pública sem alguém decidir isso via @Public(), este teste falha —
// sem precisar manter uma lista de rotas esperadas à mão.
describe('Guard global de autenticação — inventário de rotas (e2e)', () => {
  let moduleFixture: TestingModule;
  let discoveryService: DiscoveryService;
  let guard: JwtAuthGuard;
  const metadataScanner = new MetadataScanner();

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule, DiscoveryModule],
    }).compile();

    discoveryService = moduleFixture.get(DiscoveryService);
    guard = new JwtAuthGuard(moduleFixture.get(JwtService), new Reflector());
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  function buildRequestWithoutToken(
    handler: (...args: unknown[]) => unknown,
    controllerClass: new (...args: unknown[]) => unknown,
  ): ExecutionContext {
    return {
      getHandler: () => handler,
      getClass: () => controllerClass,
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ExecutionContext;
  }

  function collectHttpRoutes() {
    const routes: {
      description: string;
      isPublic: boolean;
      context: ExecutionContext;
    }[] = [];

    for (const wrapper of discoveryService.getControllers()) {
      const instance = wrapper.instance;
      if (!instance) continue;

      const controllerClass = instance.constructor as new (
        ...args: unknown[]
      ) => unknown;
      const controllerPath: string =
        Reflect.getMetadata(PATH_METADATA, controllerClass) ?? '';
      const controllerIsPublic = !!Reflect.getMetadata(
        IS_PUBLIC_KEY,
        controllerClass,
      );
      const prototype = Object.getPrototypeOf(instance);

      for (const methodName of metadataScanner.getAllMethodNames(prototype)) {
        const handler = prototype[methodName];
        const methodPath: string | undefined = Reflect.getMetadata(
          PATH_METADATA,
          handler,
        );
        if (methodPath === undefined) continue; // método auxiliar, não é rota HTTP

        const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, handler)
          ? true
          : controllerIsPublic;
        const fullPath = `/${[controllerPath, methodPath]
          .filter(Boolean)
          .join('/')}`.replace(/\/+/g, '/');

        routes.push({
          description: `${controllerClass.name}.${methodName} -> ${fullPath}`,
          isPublic,
          context: buildRequestWithoutToken(handler, controllerClass),
        });
      }
    }

    return routes;
  }

  it('toda rota registrada é @Public() ou é bloqueada pelo guard sem token', async () => {
    const routes = collectHttpRoutes();

    // Guarda contra o próprio teste ficar mudo: se o discovery não achar
    // nenhuma rota, o loop abaixo passa vazio e nada é validado de fato.
    expect(routes.length).toBeGreaterThan(10);

    for (const route of routes) {
      if (route.isPublic) {
        await expect(guard.canActivate(route.context)).resolves.toBe(true);
      } else {
        await expect(guard.canActivate(route.context)).rejects.toThrow();
      }
    }
  });
});
