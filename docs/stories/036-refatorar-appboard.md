---
title: "Story 036 — Refatorar AppBoard.vue"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 8
projectId: "project-sprinthub-core"
---
# Story 036 — Refatorar AppBoard.vue

## Objetivo

Quebrar o `AppBoard.vue` em componentes e composables. Hoje ele tem **1.179 linhas** — cerca de um quinto de todo o código de páginas do frontend num arquivo só.

## Contexto

É a tela central do produto e a que mais vai receber mudança daqui pra frente (realtime, ações de agente, filtros). Do jeito que está, cada alteração exige reler o arquivo inteiro para ter certeza de que nada quebrou, e nenhum pedaço dá para testar isoladamente.

Sintoma relacionado: o projeto tem só 2 componentes compartilhados. A lógica está toda dentro das páginas, então nada se reaproveita.

## Critérios de aceite

- [ ] Lógica de dados extraída para composables (`useBoard`, `useTaskDrag`, `useBoardFilters`)
- [ ] Componentes extraídos: coluna, card, cabeçalho do board, modal de tarefa
- [ ] `AppBoard.vue` abaixo de 300 linhas, atuando como composição
- [ ] Componentes reutilizáveis movidos para `src/components/`
- [ ] Comportamento idêntico ao atual — drag & drop, filtros, sprint ativa por padrão, badge do GitHub
- [ ] Composables cobertos por teste ([Story 035](035-testes-frontend.md))

## File list

- `apps/frontend/src/pages/AppBoard.vue`
- `apps/frontend/src/composables/useBoard.ts`
- `apps/frontend/src/components/board/*.vue`

## Notas

- Refatoração **sem mudança de comportamento**. Se aparecer vontade de melhorar a UX no meio, vira story separada — misturar as duas coisas é o que faz refatoração dar errado.
- Fazer depois da [Story 035](035-testes-frontend.md) ter pelo menos os testes de store no lugar: refatorar sem rede é como o problema começou.
- Preserva as Stories [013](013-frontend-kanban.md), [014](014-kanban-inteligente.md), [020](020-mover-backlog-para-sprint.md), [021](021-board-default-sprint-ativo.md) e [028](028-badge-github-board.md) — todas tocam esse arquivo, e os critérios de aceite delas são a especificação do que não pode quebrar.
