---
title: "Story 018 - Overview do Projeto (Métricas e Saúde do Sprint)"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-1"
---
# Story 018 - Overview do Projeto (Métricas e Saúde do Sprint)

## Descrição
Como Administrador ou Gerente,
Quero ver no Overview do projeto o status do trabalho (tarefas por status, sprint ativo e progresso),
Para ter insights de acompanhamento sem abrir o board tarefa a tarefa.

## Critérios de Aceite
- [x] Existe endpoint de métricas **por projeto**, ex.: `GET /api/projects/:id/stats` (ou `GET /api/stats?projectId=`), escopado ao tenant do JWT.
- [x] O Overview (aba da Story 017) consome apenas dados da API — **sem hardcode** de contagens.
- [x] Exibe no mínimo:
  - Total de tasks do projeto
  - Contagem por `status` (`todo`, `in_progress`, `done`)
  - Contagem no **Product Backlog** (`sprintId = null`)
  - Sprint ativo (nome, datas, goal se existir) ou estado vazio claro
  - Progresso do sprint ativo: % done e/ou pontos done vs committed (se `storyPoints` preenchidos)
- [x] Loading (skeleton/pulse) enquanto as queries carregam; banner de erro se a API falhar.
- [x] Respeita multi-tenancy: projeto de outra company retorna 403/404, nunca dados cruzados.
- [x] Burndown gráfico dia a dia **não** é obrigatório aqui (pode ser story 023); esta story entrega cards/resumo + barra de progresso simples.

## Technical Notes
- `ProjectsService.getStats(projectId)` + `GET /api/projects/:id/stats` com `JwtAuthGuard`.
- Sprint ativo: `status === 'active'`, senão intervalo de datas contendo a data atual.
- UI: `AppProjectOverview.vue` na aba Overview do hub.
- Burndown dia a dia → Story 023.
