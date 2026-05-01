# Story 014 - Kanban Inteligente (Sprints & Responsáveis)

## Descrição
Como Usuário da plataforma e Gestor,
Quero poder filtrar o Kanban por Sprint ativa e poder atribuir tarefas a membros da minha equipe,
Para que o Kanban deixe de ser apenas um "Product Backlog" estático e se torne um "Sprint Board" com atribuição de responsabilidades claras.

## Critérios de Aceite
- [x] O `AppBoard.vue` (Kanban) deve exibir um seletor no topo onde o usuário possa escolher a "Sprint Atual" ou "Product Backlog" (Todas as tarefas).
- [x] A API do Backend deve retornar as tarefas baseadas no filtro de `sprintId`.
- [x] As tarefas (Tasks) devem suportar atribuição (Assigned To) no formulário do Kanban e Backlog (utilizando o relacionamento `assigneeId` do Prisma).
- [x] O Card do Kanban deve exibir o "Avatar" do responsável caso ele esteja associado.

## Technical Notes
- `GET /api/tasks?projectId=X&sprintId=Y` já suporta filtro por sprint e `sprintId=null` para backlog.
- `include: { assignee: true }` no `findMany` retorna o objeto do responsável junto à tarefa.
- `CreateTaskDto` e `UpdateTaskDto` já incluem `assigneeId?: string` opcional.
- Fix: `saveTask` no frontend agora usa `(import.meta.env.VITE_API_URL || '') + path` para não quebrar em produção.

