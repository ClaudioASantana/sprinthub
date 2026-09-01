---
title: "Story 043 — Corrigir erros silenciosos no sync do GitHub"
type: "bug"
status: "todo"
priority: "medium"
storyPoints: 2
projectId: "project-sprinthub-core"
---
# Story 043 — Corrigir erros silenciosos no sync do GitHub

## Objetivo

Fazer o sync do GitHub falhar de forma visível quando falha. Hoje o `GithubSyncCronService` engole erro 404 e registra sucesso mesmo assim.

## Contexto

Encontrado em 01/09/2026. O cron trata a resposta de erro como se fosse um resultado vazio, e loga a sincronização como concluída. Na prática: token sem escopo, repositório renomeado ou projeto removido produzem exatamente o mesmo log de um sync bem-sucedido sem novidades.

O usuário só descobre que o sync parou quando estranha que o board não muda há dias — e nesse ponto não há nada no log que ajude a entender o motivo.

## Critérios de aceite

- [ ] Resposta não-2xx da API do GitHub gera log de erro com status, endpoint e projeto
- [ ] 404 diferenciado de resultado vazio
- [ ] Falha de autenticação (401/403) tratada à parte, com mensagem sobre escopo do token
- [ ] Contadores da execução: itens lidos, criados, atualizados, com erro
- [ ] Erro em um projeto não interrompe o sync dos demais
- [ ] Última execução e último erro visíveis na UI do projeto
- [ ] Teste com resposta de erro mockada garantindo que **não** é registrada como sucesso

## File list

- `apps/backend/src/github-sync/github-sync.cron.service.ts`
- `apps/backend/src/github-sync/github-sync.service.ts`
- `apps/frontend/src/pages/AppProjectHub.vue`

## Notas

- Relacionado às Stories [025](025-sync-github-issues.md), [027](027-sync-github-projects-status.md) e [029](029-importar-github-projects.md).
- Requer `GITHUB_TOKEN` com escopos `repo` + `project`. Escopo faltando é justamente uma das causas de 404 que hoje passa em silêncio.
