# Story 006 - Gerenciar Sprints

## Descrição
Como Administrador ou Manager de Projeto,
Quero criar, planejar e gerenciar sprints dentro de um projeto,
Para organizar a execução do trabalho em ciclos de desenvolvimento.

## Critérios de Aceite
- [x] O usuário deve conseguir visualizar a listagem de sprints de um projeto.
- [x] O usuário deve conseguir criar um novo sprint com nome, objetivo, data de início e fim.
- [x] O usuário deve conseguir editar os dados de um sprint existente.
- [x] O usuário deve conseguir remover um sprint (apenas se não houver tarefas vinculadas).
- [x] O sprint deve ter status (planning, active, completed, cancelled).
- [x] O sprint deve exibir quantidade de tarefas e pontuação/story points total.
- [x] A API backend deve expor endpoints REST para operações de CRUD de sprints.
- [x] O frontend deve consumir os endpoints e apresentar interface para gestão de sprints.

## Technical Notes
- Endpoint: `GET/POST /api/sprints`, `GET/PATCH/DELETE /api/sprints/:id`
- Módulo backend: `src/sprints/`
- Página frontend: `/dashboard/projects/:id/sprints` ou modal
- Modelo Entity: Sprint { id, name, goal, projectId, startDate, endDate, status }