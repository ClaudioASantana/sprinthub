---
title: "Story 041 — Atualização em tempo real do board"
type: "story"
status: "todo"
priority: "low"
storyPoints: 5
projectId: "project-sprinthub-core"
---
# Story 041 — Atualização em tempo real do board

## Objetivo

Dois usuários no mesmo board enxergam as mudanças um do outro sem recarregar a página.

## Contexto

Hoje não há WebSocket nem SSE em lugar nenhum. Numa daily com o board projetado, cada pessoa vê um estado diferente — e alguém perde trabalho ao salvar por cima.

Vira requisito de verdade quando o agente passar a escrever no board ([Stories 038](038-mcp-remoto-autenticado.md) e [039](039-propor-e-aprovar-acoes-agente.md)): mudança feita por IA que só aparece depois de um F5 é pior do que não ter a IA.

## Critérios de aceite

- [ ] Gateway WebSocket no backend, autenticado pelo mesmo JWT
- [ ] Assinatura por sala de projeto, respeitando o isolamento de tenant
- [ ] Eventos: task criada, atualizada, movida, removida; sprint alterada; proposta de agente criada
- [ ] Board aplica o evento sem recarregar e sem perder o estado local (filtro, scroll, drag em curso)
- [ ] Reconexão automática com ressincronização ao voltar
- [ ] Presença: quem mais está olhando este board
- [ ] Degradação limpa — sem conexão, o board continua funcionando por requisição

## File list

- `apps/backend/src/events/events.gateway.ts`
- `apps/backend/src/events/events.module.ts`
- `apps/frontend/src/composables/useRealtime.ts`
- `apps/frontend/src/pages/AppBoard.vue`

## Notas

- Fazer depois da [Story 036](036-refatorar-appboard.md). Enfiar realtime num componente de 1.179 linhas é garantir bug difícil de achar.
- Prioridade baixa de propósito: é o tipo de recurso que impressiona em demo e não fecha venda. Segurança e rentabilidade vêm antes.
- Se o custo de operar WebSocket no Coolify pesar, SSE resolve o caso de uso principal (o board só precisa receber, não enviar).
