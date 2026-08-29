---
title: "Story 017 - Hub do Projeto (Abas Overview / Backlog / Board / Sprints)"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-1"
---
# Story 017 - Hub do Projeto (Abas Overview / Backlog / Board / Sprints)

## Descrição
Como Membro de Equipe ou Administrador,
Quero abrir um projeto e navegar entre Overview, Backlog, Board e Sprints no mesmo contexto,
Para acompanhar o trabalho como em ferramentas de sprint (Linear, Jira, GitHub Projects), sem saltar entre telas globais desconectadas.

## Critérios de Aceite
- [x] Ao clicar em um projeto (lista `/dashboard/projects` ou `/app`), o usuário entra em um **hub** do projeto (ex.: `/app/project/:id` ou `/dashboard/projects/:id`).
- [x] O hub exibe abas (ou navegação equivalente): **Overview**, **Backlog**, **Board**, **Sprints**.
- [x] A aba ativa preserva o `projectId` na URL (deep-link funciona ao recarregar).
- [x] **Board** reutiliza o Kanban existente (`AppBoard.vue` / lógica atual), filtrado pelo projeto.
- [x] **Backlog** lista apenas tasks do projeto com `sprintId = null` (product backlog).
- [x] **Sprints** lista sprints do projeto e permite criar/editar no contexto do projeto (não lista global sem filtro).
- [x] **Overview** pode ser placeholder mínimo nesta story (métricas detalhadas ficam na 018), mas deve mostrar ao menos nome, descrição e sprint ativo (se houver).
- [x] Navegação “Voltar para projetos” retorna à listagem sem perder o token/sessão.
- [x] Layout e tokens visuais seguem o padrão glass-panel / AppLayout existentes.

## Technical Notes
- Shell: `AppProjectHub.vue` + children em `/app/project/:id/{overview|backlog|board|sprints}`.
- Redirect default: `board`.
- Reuso: `AppBoard.vue`, `DashboardBacklog.vue`, `DashboardSprints.vue` (projectId via `route.params.id`).
- Overview mínimo: `AppProjectOverview.vue` (Story 018 completa métricas).
- Deep link demo: `/app/project/project-sprinthub-core/board`
