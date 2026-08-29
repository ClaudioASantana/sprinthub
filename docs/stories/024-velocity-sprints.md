---
title: "Story 024 - Velocity (últimos N sprints)"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-1"
---
# Story 024 - Velocity (últimos N sprints)

## Descrição
Como Product Owner,
Quero ver a velocity dos sprints concluídos,
Para estimar capacidade dos próximos ciclos com base no histórico.

## Critérios de Aceite
- [x] Endpoint `GET /api/projects/:id/velocity` retorna sprints `completed` (até 5) com pontos done e média.
- [x] Overview exibe barras de velocity + média.
- [x] Projeto sem sprints concluídos mostra estado vazio claro.
- [x] Respeita tenant (JWT) como nas demais métricas.

## Technical Notes
- `ProjectsService.getVelocity`
- UI no Overview abaixo do burndown
- Seed já inclui Sprint 0 completed com tasks done
