---
title: "Story 030 — Guard global de autenticação"
type: "story"
status: "done"
priority: "high"
storyPoints: 3
projectId: "project-sprinthub-core"
---
# Story 030 — Guard global de autenticação

## Objetivo

Inverter o default de segurança da API: hoje uma rota nasce **aberta** e só fecha se alguém lembrar de escrever `@UseGuards(JwtAuthGuard)`. Passa a nascer **fechada**, e a exceção vira explícita com `@Public()`.

## Contexto

Levantamento em 01/09/2026: das 10 controllers, apenas 4 usam `UseGuards` (companies, tasks, app, projects). Ficam abertas sem nenhum token: `auth`, `github-sync`, `sprints`, `sync-stories`, `teams`, `users`.

Verificado contra o backend local, sem autenticação nenhuma:

```
GET /api/tasks    -> 200   153 tarefas de todos os tenants
GET /api/sprints  -> 200   3 sprints
GET /api/teams    -> 200   2 times
GET /api/users?companyId=<id>  -> 200  e-mail, nome e role dos usuários
```

O erro não é ter esquecido de 6 controllers — é o modelo em que esquecer é possível.

## Critérios de aceite

- [x] `JwtAuthGuard` registrado como `APP_GUARD` no `AppModule`
- [x] Decorator `@Public()` criado e o guard respeita a metadata via `Reflector`
- [x] `@Public()` aplicado apenas onde é intencional (login e health check)
- [x] Os `@UseGuards(JwtAuthGuard)` redundantes nas 4 controllers são removidos
- [x] Requisição sem token retorna 401 em todas as rotas não marcadas como públicas
- [x] Teste e2e cobrindo: rota pública responde 200 sem token; rota comum responde 401
- [x] Teste que percorre todas as rotas registradas e falha se alguma nova rota pública aparecer sem `@Public()` declarado

## File list

- `apps/backend/src/app.module.ts` — registra `JwtAuthGuard` como `APP_GUARD`
- `apps/backend/src/auth/decorators/public.decorator.ts` — novo
- `apps/backend/src/auth/guards/jwt-auth.guard.ts` — passa a checar `@Public()` via `Reflector` antes de exigir token
- `apps/backend/src/app.controller.ts` — `@Public()` no health check (`GET /`), remove `@UseGuards` redundante de `/stats`
- `apps/backend/src/auth/auth.controller.ts` — `@Public()` na classe inteira (é o próprio fluxo de login)
- `apps/backend/src/tasks/tasks.controller.ts` — remove `@UseGuards(JwtAuthGuard)` redundante
- `apps/backend/src/projects/projects.controller.ts` — remove os 7 `@UseGuards(JwtAuthGuard)` redundantes
- `apps/backend/test/app.e2e-spec.ts` — cobre rota pública (200) e rota comum sem token (401)
- `apps/backend/test/public-routes.e2e-spec.ts` — novo; varre todas as rotas via `DiscoveryService`/`MetadataScanner` e chama o guard de verdade para cada uma
- `apps/backend/test/jest-e2e.json` + `apps/backend/test/__mocks__/octokit-rest.js` — fix de infra encontrado no caminho: `@octokit/rest` é ESM-only e quebrava o parser do Jest assim que a `AppModule` inteira era carregada, então nenhum e2e rodava (nem o pré-existente). Mockado só nos testes.

## Notas

- Sozinha esta story **não** resolve o vazamento entre tenants: com um token válido de qualquer empresa ainda dá para ler dados de outra. Isso é a [Story 031](031-isolamento-tenant-jwt.md).
- Também não resolve a emissão livre de token pelo `dev-login` — [Story 032](032-autenticacao-real-dev-login.md). As três precisam entrar juntas para a API ficar de fato fechada.
- O último critério de aceite é o que impede a regressão: sem ele, a próxima controller nasce aberta de novo.
- `companies` mantém `@UseGuards(SuperAdminGuard)` — não é redundante, ele exige `profile: super_admin` além da autenticação. Com o guard global os dois rodam em sequência (`JwtAuthGuard` primeiro).
- `test:e2e` continua fora do `pnpm run test` da CI (precisa de Postgres real — `PrismaService.$connect()` roda no `app.init()`). Rodar manualmente com `pnpm --filter backend test:e2e` contra o banco local.
