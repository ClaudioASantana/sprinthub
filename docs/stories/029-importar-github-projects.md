---
title: "Story 029 — Importar GitHub Projects para a lista"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-1"
---
# Story 029 — Importar GitHub Projects para a lista

## Objetivo

Permitir listar GitHub Projects v2 acessíveis pelo token do backend e importá-los como `Project` no SprintHub (com sync de itens → Tasks).

## Critérios de aceite

- [x] `GET /api/projects/github/list` (JWT) lista Projects do viewer + orgs
- [x] `POST /api/projects/github/import` cria Project com `githubOwner`, `githubProjectNumber`, `githubProjectId`, `githubProjectUrl`
- [x] Idempotente por `@@unique([companyId, githubProjectId])`
- [x] Sync opcional dos itens do Project após import
- [x] UI em Meus Projetos: botão **Importar do GitHub**
- [x] Badge GitHub nos cards importados

## File list

- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/projects/projects.service.ts`
- `apps/backend/src/projects/projects.controller.ts`
- `apps/frontend/src/pages/AppProjects.vue`
- `docs/stories/029-importar-github-projects.md`

## Notas

- Requer `GITHUB_TOKEN` / `GH_TOKEN` com escopos `repo` + `project` (e `read:project` se aplicável).
- Listagem **não** usa `viewer.organizations` (exige `read:org`). Projects de org: query `?org=login` ou env `GITHUB_ORGS`.
- Sync importa **Issue**, **DraftIssue** e **PullRequest** do Project (muitos backlogs novos são só drafts).
- A lista de projetos do SprintHub continua sendo a fonte local; GitHub Projects entram via import explícito.
