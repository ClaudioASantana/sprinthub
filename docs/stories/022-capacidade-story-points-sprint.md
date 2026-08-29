---
title: "Story 022 - Capacidade / Story Points no Sprint"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-1"
---
# Story 022 - Capacidade / Story Points no Sprint

## Descrição
Como Product Owner,
Quero definir a capacidade do sprint em story points e ver committed vs capacidade,
Para evitar overcommit no planning.

## Critérios de Aceite
- [x] Campo `capacityPoints` no model `Sprint` (Prisma).
- [x] Criar/editar sprint permite informar capacidade.
- [x] Cards de sprint mostram pontos committed vs capacidade.
- [x] Board (com sprint selecionado) mostra barra de pontos done/committed/capacidade.
- [x] Overview do projeto inclui capacidade do sprint ativo quando definida.

## Technical Notes
- Schema: `Sprint.capacityPoints Int?`
- Seed: Sprint 0 = 30, Sprint 1 = 40
- Stats API: `capacityPoints` + `capacityRemaining`
