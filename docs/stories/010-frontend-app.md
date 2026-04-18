# Story 010 - Frontend App (Cliente Final)

## Descrição
Como Usuário membro de uma empresa,
Quero acessar o painel de projetos via App Vue para visualizar e gerenciar minhas tarefas,
Para acompanhar o progresso do meu trabalho em sprints.

## Critérios de Aceite
- [x] Criar app separate em `apps/frontend/` (ou usar `apps/frontend` para usuário final).
- [x] Implementar App Shell com navegação principal.
- [x] Exibir listagem de projetos do usuário.
- [x] Exibir board Kanban com tarefas do sprint.
- [x] Exibir detalhes de tarefas com edição inline.
- [x] Exibir página de perfil do usuário.
- [x] Consumir APIs existentes do backend.

## Technical Notes
- Reutilizar `packages/shared` para tipos
- Autenticação via JWT (já implementada)
- Rotas: `/projects`, `/projects/:id/sprints`, `/tasks`, `/profile`