---
title: "Story 021 - Board default = sprint ativo"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-1"
---
# Story 021 - Board default = sprint ativo

## Descrição
Como Membro de Equipe,
Quero que o Board abra já filtrado no sprint ativo,
Para focar imediatamente no trabalho do ciclo corrente.

## Critérios de Aceite
- [x] Ao abrir `/app/project/:id/board`, o filtro de sprint inicia no sprint `active` (ou na janela de datas), não em “Todas”.
- [x] Query `?sprint=<id|backlog|all>` sobrescreve o default.
- [x] Troca manual do filtro continua funcionando nas navegações seguintes da sessão da página.
- [x] `GET /api/sprints?projectId=` filtra corretamente pelo projeto.

## Technical Notes
- `AppBoard.vue`: `resolveDefaultSprintId` + `sprintFilterInitialized`.
- `SprintsController.findAll` aceita `projectId` query.
