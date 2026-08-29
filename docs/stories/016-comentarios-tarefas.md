---
title: "Story 016 - Comentários nas Tarefas"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-1"
---
# Story 016 - Comentários nas Tarefas

## Descrição
Como Membro da Equipe ou Gestor,
Quero poder adicionar e visualizar comentários em uma tarefa específica,
Para centralizar a comunicação, dúvidas e o histórico de discussões no próprio contexto do card no Kanban.

## Critérios de Aceite (Tasks)

**Banco de Dados & Prisma:**
- [x] Criar o modelo `Comment` no `schema.prisma` (relacionado a `Task` e `User`).
- [x] Gerar e aplicar a migration no banco de dados (`prisma migrate dev` / `db push`).

**Backend (API):**
- [x] Criar o endpoint `POST /api/tasks/:id/comments` para criação de um novo comentário.
- [x] Criar o endpoint `GET /api/tasks/:id/comments` para listagem de comentários de uma tarefa (trazendo os dados do `author`).

**Frontend:**
- [x] No modal/painel de detalhes da Tarefa, criar a interface para a seção "Comentários".
- [x] Implementar a listagem de comentários em ordem cronológica (exibindo foto/nome do autor, data e texto).
- [x] Implementar o campo de texto (textarea) e o botão "Comentar" integrado com a API.
- [x] (Opcional) Adicionar um ícone de "balãozinho" com o contador de comentários no card resumido exibido nas colunas do Kanban.

## Technical Notes
- Autor resolvido por `authorId` JWT, senão `email`, senão primeiro user ativo da company (compatível com `dev-login`).
- Login demo membro usa `po@demo.com` (usuário do seed).
- Contador `_count.comments` no listagem do board.
