# Story 005 - Gerenciar Projetos

## Descrição
Como Administrador de Empresa autenticado,
Quero criar, editar e remover projetos vinculados à minha empresa,
Para organizar os trabalhos que serão executados pelas equipes.

## Critérios de Aceite
- [x] O Administrador deve conseguir visualizar a listagem de projetos da empresa.
- [x] O Administrador deve conseguir criar um novo projeto com nome, descrição e equipe vinculada.
- [x] O Administrador deve conseguir editar os dados de um projeto existente.
- [x] O Administrador deve conseguir remover um projeto (soft delete).
- [x] Cada projeto deve permitir selecionar uma equipe responsável.
- [x] O projeto deve ter status (ativo, inativo, arquivado).
- [x] A API backend deve expor endpoints REST para operações de CRUD de projetos.
- [x] O frontend deve consumir os endpoints e apresentar interface para gestão de projetos.

## Technical Notes
- Endpoint: `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/:id`
- Módulo backend: `src/projects/`
- Página frontend: `/dashboard/projects`
- Modelo Entity: Project { id, name, description, companyId, teamId, status, startDate, endDate }