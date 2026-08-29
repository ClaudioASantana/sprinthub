---
title: "Story 027 - Sync Status GitHub Projects v2"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-1"
---
# Story 027 - Sync Status GitHub Projects v2

## Descrição
Como Product Owner,
Quero que o Status do GitHub Project (board) atualize o status das Tasks no SprintHub,
Para espelhar o andamento do board externo sem editar card a card.

## Critérios de Aceite
- [x] Project armazena `githubProjectNumber` (opcional).
- [x] No Overview, campo Project # junto de owner/repo.
- [x] No sync, se Project # estiver definido, busca itens via GraphQL Projects v2.
- [x] Campo Status do Project mapeia para `todo` / `in_progress` / `done`.
- [x] Status do Project sobrescreve o state open/closed da Issue quando disponível.
- [x] Funciona para project de organization ou user (mesmo login do owner).

## Technical Notes
- GraphQL `organization|user { projectV2(number) { items } }`
- Token precisa de escopo `read:project` (e `repo` para issues privadas)
- Mapeamento PT/EN: Done/Feito → done; In Progress/Andamento → in_progress; demais → todo
