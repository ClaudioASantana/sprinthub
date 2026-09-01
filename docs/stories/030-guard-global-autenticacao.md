---
title: "Story 030 — Guard global de autenticação"
type: "story"
status: "todo"
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

- [ ] `JwtAuthGuard` registrado como `APP_GUARD` no `AppModule`
- [ ] Decorator `@Public()` criado e o guard respeita a metadata via `Reflector`
- [ ] `@Public()` aplicado apenas onde é intencional (login e health check)
- [ ] Os `@UseGuards(JwtAuthGuard)` redundantes nas 4 controllers são removidos
- [ ] Requisição sem token retorna 401 em todas as rotas não marcadas como públicas
- [ ] Teste e2e cobrindo: rota pública responde 200 sem token; rota comum responde 401
- [ ] Teste que percorre todas as rotas registradas e falha se alguma nova rota pública aparecer sem `@Public()` declarado

## File list

- `apps/backend/src/app.module.ts`
- `apps/backend/src/auth/decorators/public.decorator.ts`
- `apps/backend/src/auth/guards/jwt-auth.guard.ts`
- `apps/backend/src/**/*.controller.ts`

## Notas

- Sozinha esta story **não** resolve o vazamento entre tenants: com um token válido de qualquer empresa ainda dá para ler dados de outra. Isso é a [Story 031](031-isolamento-tenant-jwt.md).
- Também não resolve a emissão livre de token pelo `dev-login` — [Story 032](032-autenticacao-real-dev-login.md). As três precisam entrar juntas para a API ficar de fato fechada.
- O último critério de aceite é o que impede a regressão: sem ele, a próxima controller nasce aberta de novo.
