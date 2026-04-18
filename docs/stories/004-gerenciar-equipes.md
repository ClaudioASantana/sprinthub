# Story 004 - Gerenciar Equipes

## Descrição
Como Administrador de Empresa autenticado,
Quero criar, editar e remover equipes de trabalho vinculadas à minha empresa,
Para organizar os colaboradores que terão acesso aos projetos e sprints do sistema.

## Critérios de Aceite
- [x] O Administrador deve conseguir visualizar a listagem de equipes existentes na empresa.
- [x] O Administrador deve conseguir criar uma nova equipe com nome e descrição.
- [x] O Administrador deve conseguir editar os dados de uma equipe existente.
- [x] O Administrador deve conseguir remover uma equipe (soft delete).
- [x] Cada equipe deve permitir vincular/desvincular membros (usuários).
- [x] A API backend deve expor endpoints REST para operações de CRUD de equipes.
- [x] O frontend deve consumir os endpoints e apresentar interface para gestão de equipes.

## Technical Notes
- Endpoint: `GET/POST /api/teams`, `GET/PATCH/DELETE /api/teams/:id`
- Módulo backend: `src/teams/`
- Página frontend: `/dashboard/teams`
- Modelo Entity: Team { id, name, description, companyId, active, members[] }