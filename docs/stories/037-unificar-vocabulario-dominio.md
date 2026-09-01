---
title: "Story 037 — Unificar o vocabulário de domínio (status, prioridade, tipo)"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 3
projectId: "project-sprinthub-core"
---
# Story 037 — Unificar o vocabulário de domínio (status, prioridade, tipo)

## Objetivo

Ter **uma** fonte da verdade para os valores de `status`, `priority` e `type` de Task. Hoje há três definições divergentes no mesmo repositório.

## Contexto

Divergência encontrada em 01/09/2026:

| Origem | status | priority |
| --- | --- | --- |
| `prisma/schema.prisma` (comentário) | `todo, in_progress, done` | `low, medium, high` |
| `create-task.dto.ts` (`@IsEnum`) | `todo, in_progress, review, done` | `low, medium, high, critical` |
| `mcp-server/tools.ts` | `todo, in_progress, done` | `low, medium, high` |
| Kanban (`AppBoard.vue`) | 3 colunas | — |

Efeito real: a API REST aceita `review` e `critical`, o MCP recusa, e o board não tem coluna para `review`. Uma tarefa criada por REST com `status: 'review'` é gravada e **some do Kanban**.

Como os campos são `String` no Prisma, o banco aceita qualquer coisa — não há nada barrando lixo.

## Decisão pendente

Antes de implementar, definir o conjunto oficial. **Isso é decisão de produto, não técnica.** As opções:

- **A — 3 status, 3 prioridades.** Mantém o Kanban simples; alinha DTO e banco ao que já existe. Reduz superfície.
- **B — 4 status (com `review`), 4 prioridades (com `critical`).** Exige coluna de review no board e revisão da capacidade/burndown. Mais fiel a times que fazem code review como etapa.

Recomendação: **A agora, B depois se o uso pedir.** `review` como coluna é fácil de acrescentar; difícil é tirar depois que times passaram a depender dela.

## Critérios de aceite

- [ ] Conjunto oficial decidido e registrado neste arquivo
- [ ] Enums nativos do Prisma (`enum TaskStatus`, `TaskPriority`, `TaskType`) substituindo `String`
- [ ] Migration convertendo os dados existentes (checar se há registro com valor fora do conjunto antes de aplicar)
- [ ] DTOs derivam dos enums do Prisma, sem lista literal duplicada
- [ ] `mcp-server/tools.ts` deriva dos mesmos enums; `TASK_STATUSES`/`TASK_PRIORITIES`/`TASK_TYPES` deixam de ser literais
- [ ] Frontend deriva as colunas do mesmo conjunto
- [ ] `tools.spec.ts` continua passando (os testes já travam a descrição das tools contra as constantes)

## File list

- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma/migrations/`
- `apps/backend/src/tasks/dto/create-task.dto.ts`
- `apps/backend/src/tasks/dto/update-task.dto.ts`
- `apps/backend/src/mcp-server/tools.ts`
- `apps/frontend/src/pages/AppBoard.vue`

## Notas

- Trocar `String` por `enum` no Prisma é o que faz o banco parar de aceitar valor inválido. Sem isso, a validação continua dependendo de cada porta de entrada lembrar de validar — mesmo padrão de falha da [Story 030](030-guard-global-autenticacao.md).
- Rodar o levantamento de valores fora do conjunto **antes** de escrever a migration, ou ela quebra em produção.
