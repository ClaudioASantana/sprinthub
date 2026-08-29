---
title: "Story 026 - Mapear labels/status GitHub → SprintHub"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-1"
---
# Story 026 - Mapear labels/status GitHub → SprintHub

## Descrição
Como Product Owner,
Quero que labels e estado das Issues influenciem type/priority/status das Tasks,
Para o board refletir a taxonomia do GitHub sem edição manual.

## Critérios de Aceite
- [x] Label contendo `bug`/`defect` → type `bug`
- [x] Label contendo `epic` → type `epic`
- [x] Label contendo `task`/`chore` → type `task` (senão default `story`)
- [x] Labels de prioridade (`high`/`p1`/`urgent`/`critical`, `low`/`p3`) → priority
- [x] `state=closed` → status `done`; open → `todo`
- [x] Documentado na sync (025)

## Technical Notes
- Implementado em `mapGithubIssue` dentro de `ProjectsService.syncGithubIssues`
- Evolução futura: mapear Status de GitHub Projects v2 (campo Status) — fora deste escopo
