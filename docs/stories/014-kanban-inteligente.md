# Story 014 - Kanban Inteligente (Sprints & Responsáveis)

## Descrição
Como Usuário da plataforma e Gestor,
Quero poder filtrar o Kanban por Sprint ativa e poder atribuir tarefas a membros da minha equipe,
Para que o Kanban deixe de ser apenas um "Product Backlog" estático e se torne um "Sprint Board" com atribuição de responsabilidades claras.

## Critérios de Aceite
- [ ] O `AppBoard.vue` (Kanban) deve exibir um seletor no topo onde o usuário possa escolher a "Sprint Atual" ou "Product Backlog" (Todas as tarefas).
- [ ] A API do Backend deve retornar as tarefas baseadas no filtro de `sprintId`.
- [ ] As tarefas (Tasks) devem suportar atribuição (Assigned To) no formulário do Kanban e Backlog (utilizando o relacionamento `assigneeId` do Prisma).
- [ ] O Card do Kanban deve exibir o "Avatar" do responsável caso ele esteja associado.

## Technical Notes
- O banco de dados já possui `assigneeId` em `Task` apontando para `User`. Precisamos atualizar o `CreateTaskDto` e `UpdateTaskDto` no backend.
- O endpoint de Frontend deverá buscar `GET /api/sprints?projectId={id}` e gerar um select/dropdown no Header do projeto.
- Quando o filtro muda, o board deve realizar um recarregamento `fetchData`.
