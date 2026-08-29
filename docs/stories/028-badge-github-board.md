---
title: "Story 028 - Badge/link GitHub no Board"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-1"
---
# Story 028 - Badge/link GitHub no Board

## Descrição
Como Membro de Equipe,
Quero ver e abrir a Issue do GitHub direto no card do Kanban,
Para navegar rápido entre SprintHub e GitHub.

## Critérios de Aceite
- [x] Cards com `githubIssueUrl` exibem badge `#N`.
- [x] Clique no badge abre a Issue em nova aba (sem abrir o painel do card).
- [x] Badge aparece nas três colunas do board.

## Technical Notes
- `AppBoard.vue` — `@click.stop` no link
- Campos `githubIssueNumber` / `githubIssueUrl` vindos do sync 025
