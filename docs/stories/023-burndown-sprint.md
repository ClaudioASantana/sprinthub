---
title: "Story 023 - Burndown do Sprint"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-1"
---
# Story 023 - Burndown do Sprint

## Descrição
Como Gerente ou Product Owner,
Quero ver o burndown do sprint ativo (ideal vs real),
Para acompanhar se o time está no ritmo esperado até o fim do ciclo.

## Critérios de Aceite
- [x] Endpoint `GET /api/sprints/:id/burndown` retorna série diária (ideal + remaining).
- [x] Overview do projeto exibe gráfico (SVG) do sprint ativo.
- [x] Ideal = linha reta do committed até 0; real usa tasks `done` por `updatedAt` (aproximação).
- [x] Se não houver story points, usa contagem de tasks como unidade.
- [x] Dias futuros não inventam remaining (null).

## Technical Notes
- `SprintsService.getBurndown`
- UI: `AppProjectOverview.vue` (sem lib de charts)
- Limitação conhecida: sem event log de status; `updatedAt` aproxima a data de conclusão
