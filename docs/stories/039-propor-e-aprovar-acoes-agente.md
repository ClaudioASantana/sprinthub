---
title: "Story 039 — Propor-e-aprovar para ações de agente"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-sprinthub-core"
---
# Story 039 — Propor-e-aprovar para ações de agente

## Objetivo

Dar ao usuário controle sobre o que a IA muda no board: o agente **propõe**, o humano **aprova**, tudo fica rastreável e reversível.

## Contexto

Quando o MCP virar remoto ([Story 038](038-mcp-remoto-autenticado.md)), um agente vai poder criar tarefa, estimar e mover card em produção. Board que muda sozinho sem explicação é o motivo número um de rejeição desse tipo de recurso: o usuário perde a noção do que é seu e para de confiar na ferramenta.

É também o ponto onde dá para ser melhor que os incumbentes. A aposta do mercado em 2026 é agente autônomo; a objeção real dos times é justamente autonomia sem supervisão.

## Critérios de aceite

- [ ] Model `Proposal`: `id`, `companyId`, `projectId`, `actorId`, `kind`, `payload`, `status` (pending | approved | rejected | applied), `createdAt`, `decidedAt`, `decidedBy`
- [ ] Tools de escrita do MCP aceitam modo `propose` além de execução direta
- [ ] Política configurável por projeto: quais ações o agente aplica direto e quais exigem aprovação
- [ ] Leitura (`list_*`) nunca exige aprovação
- [ ] UI: fila de pendências no hub do projeto, com diff legível do que será alterado
- [ ] Aprovar aplica a mudança; recusar descarta e devolve o motivo ao agente
- [ ] Desfazer uma ação já aplicada, usando o `before` da auditoria
- [ ] Card alterado por agente sinalizado visualmente no board

## File list

- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/proposals/`
- `apps/backend/src/mcp-server/tools.ts`
- `apps/frontend/src/pages/AppProjectHub.vue`
- `apps/frontend/src/components/board/`

## Notas

- Default recomendado: leitura livre, escrita sob aprovação. Time que confia afrouxa depois; o contrário custa a confiança de uma vez.
- Depende da [Story 033](033-log-auditoria.md) — o desfazer sai do `before` gravado na auditoria.
- Combina com a [Story 041](041-realtime-board.md): a fila de pendências aparecendo em tempo real é o que torna o fluxo natural.
