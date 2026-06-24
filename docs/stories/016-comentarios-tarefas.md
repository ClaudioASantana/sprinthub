# Story 016 - Comentários nas Tarefas

## Descrição
Como Membro da Equipe ou Gestor,
Quero poder adicionar e visualizar comentários em uma tarefa específica,
Para centralizar a comunicação, dúvidas e o histórico de discussões no próprio contexto do card no Kanban.

## Critérios de Aceite (Tasks)

**Banco de Dados & Prisma:**
- [ ] Criar o modelo `Comment` no `schema.prisma` (relacionado a `Task` e `User`).
- [ ] Gerar e aplicar a migration no banco de dados (`prisma migrate dev`).

**Backend (API):**
- [ ] Criar o endpoint `POST /api/tasks/:id/comments` para criação de um novo comentário.
- [ ] Criar o endpoint `GET /api/tasks/:id/comments` para listagem de comentários de uma tarefa (trazendo os dados do `author`).

**Frontend:**
- [ ] No modal/painel de detalhes da Tarefa, criar a interface para a seção "Comentários".
- [ ] Implementar a listagem de comentários em ordem cronológica (exibindo foto/nome do autor, data e texto).
- [ ] Implementar o campo de texto (textarea) e o botão "Comentar" integrado com a API.
- [ ] (Opcional) Adicionar um ícone de "balãozinho" com o contador de comentários no card resumido exibido nas colunas do Kanban.

## Technical Notes
- **Prisma Model (Sugestão):** 
  ```prisma
  model Comment {
    id        String   @id @default(uuid())
    content   String   @db.Text
    taskId    String
    task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
    authorId  String
    author    User     @relation(fields: [authorId], references: [id])
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }
  ```
- **Fuso horário e Data:** Garantir que o frontend formate a data relativa de forma amigável (ex: "há 2 horas", "em 12/04 às 14:00").
