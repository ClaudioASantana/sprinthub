---
title: "Story 031 — Isolamento de tenant pelo companyId do JWT"
type: "story"
status: "todo"
priority: "high"
storyPoints: 5
projectId: "project-sprinthub-core"
---
# Story 031 — Isolamento de tenant pelo companyId do JWT

## Objetivo

Fazer o `companyId` vir **sempre** do token autenticado, nunca de query string ou body. Hoje o cliente escolhe de qual empresa quer ler.

## Contexto

Cadeia de enumeração reproduzida em 01/09/2026 no backend local:

1. `GET /api/teams` sem token devolve os times **com o `companyId`**
2. `GET /api/users?companyId=<companyId vazado>` devolve os usuários daquela empresa: `id`, `email`, `name`, `role`, `active`, `createdAt`, `companyId`, `teamId`

O `users.controller.ts` lê `@Query('companyId')` e confia. Qualquer um informa qualquer empresa.

Isso é o oposto do que o `AGENTS.md` exige ("Respeite multi-tenancy — isolamento por Company"): a regra existe no documento e não existe no código.

## Critérios de aceite

- [ ] Decorator `@CurrentUser()` (ou equivalente) expõe o payload do JWT já tipado
- [ ] Nenhuma controller aceita `companyId` de `@Query` ou `@Body` — auditado com grep no CI
- [ ] Todo `findMany`/`findUnique` de recurso multi-tenant filtra por `companyId` do token
- [ ] Acesso a recurso de outra empresa por ID direto retorna **404** (não 403 — 403 confirma que o recurso existe)
- [ ] `super_admin` continua podendo atravessar tenants, por caminho explícito e separado
- [ ] Testes: usuário da empresa A não lê, não edita e não apaga recurso da empresa B — um teste por recurso (projects, sprints, tasks, teams, users, comments)

## File list

- `apps/backend/src/auth/decorators/current-user.decorator.ts`
- `apps/backend/src/users/users.controller.ts`
- `apps/backend/src/teams/teams.controller.ts`
- `apps/backend/src/sprints/sprints.controller.ts`
- `apps/backend/src/tasks/tasks.controller.ts`
- `apps/backend/src/projects/projects.controller.ts`
- `apps/backend/src/**/*.service.ts`

## Notas

- Depende da [Story 030](030-guard-global-autenticacao.md) — sem token garantido não há de onde tirar o `companyId`.
- `Sprint` e `Task` não têm `companyId` próprio: o vínculo é via `Project`. Ou o filtro passa por join, ou vale desnormalizar `companyId` nessas tabelas. Desnormalizar é mais rápido de consultar e mais fácil de auditar, ao custo de manter sincronizado — decisão a tomar na implementação.
- Vale avaliar middleware de Prisma (`$extends`) para aplicar o filtro por padrão, em vez de depender de cada service lembrar. Mesmo princípio da 030: o default tem que ser seguro.
