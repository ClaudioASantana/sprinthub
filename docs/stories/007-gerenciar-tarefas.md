# Story 007 - Gerenciar Backlog e Tarefas

## Descrição
Como Administrador ou Membro de Equipe,
Quero criar, editar e gerenciar tarefas no backlog de um projeto,
Para organizar e acompanhar o trabalho a ser executado.

## Critérios de Aceite
- [x] O usuário deve conseguir visualizar a listagem de tarefas do projeto/sprint.
- [x] O usuário deve conseguir criar uma nova tarefa com título, descrição e tipo.
- [x] O usuário deve conseguir editar os dados de uma tarefa existente.
- [x] O usuário deve conseguir mover tarefa entre colunas (todo, in_progress, done).
- [x] A tarefa deve ter campos: título, descrição, tipo (story, bug, task, epic), prioridade, assignee.
- [x] O usuário deve conseguir excluir uma tarefa.
- [x] A API backend deve expor endpoints REST para operações de CRUD de tarefas.
- [x] O frontend deve consumir os endpoints e apresentar interface Kanban.

## Technical Notes
- Endpoint: `GET/POST /api/tasks`, `GET/PATCH/DELETE /api/tasks/:id`
- Módulo backend: `src/tasks/`
- Página frontend: `/dashboard/tasks` com colunas Kanban
- Modelo Entity: Task { id, title, description, type, status, priority, projectId, sprintId, assigneeId }