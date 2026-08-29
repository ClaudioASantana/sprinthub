---
title: "Story 020 - Arrastar Backlog → Sprint"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-1"
---
# Story 020 - Arrastar Backlog → Sprint

## Descrição
Como Product Owner ou Membro de Equipe,
Quero mover itens do Product Backlog para um sprint (por drag-and-drop ou ação explícita),
Para fazer o planning do sprint sem editar cada tarefa manualmente.

## Critérios de Aceite
- [x] Na aba Backlog do hub, listar sprints do projeto (ao menos os `planning`/`active`) como destinos.
- [x] Permitir arrastar uma task do backlog e soltar em um sprint destino → `PATCH` com `sprintId`.
- [x] Alternativa sem drag: seletor/ação “Mover para sprint…” por linha.
- [x] Após mover, a task some do backlog (`sprintId = null`) e aparece no board daquele sprint.
- [x] Feedback visual de drop zone (hover) e estado vazio claro.
- [x] Erro da API exibido de forma simples (alert ou banner).

## Technical Notes
- UI: `DashboardBacklog.vue` no hub (`/app/project/:id/backlog`).
- API: `PATCH /api/tasks/:id` com `{ sprintId }`.
- Sprints: `GET /api/sprints?projectId=`.
