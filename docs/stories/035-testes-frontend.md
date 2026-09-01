---
title: "Story 035 — Testes automatizados do frontend"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-sprinthub-core"
---
# Story 035 — Testes automatizados do frontend

## Objetivo

Dar rede de segurança ao frontend. Hoje `apps/frontend` e `apps/sprinthub-admin` têm **zero** testes — nenhum runner sequer configurado.

## Contexto

São ~5.400 linhas de páginas Vue sem nenhuma verificação automática. Toda validação é manual, no browser. O efeito prático não é o bug que escapa — é o medo de mexer: quanto mais tempo passa, menos alguém encosta no código antigo.

## Critérios de aceite

- [ ] Vitest + `@vue/test-utils` configurados nos dois apps
- [ ] Script `test` no `package.json` de cada app, integrado ao [CI](034-pipeline-ci.md)
- [ ] Testes dos stores/composables de estado (a lógica que não depende de DOM)
- [ ] Testes da camada de API: monta a URL certa, envia o token, trata erro
- [ ] Teste de componente do Kanban: mover card entre colunas emite a ação esperada
- [ ] Teste de guarda de rota: sem sessão, redireciona para o login
- [ ] Cobertura reportada no CI (sem gate de percentual num primeiro momento)

## File list

- `apps/frontend/vitest.config.ts`
- `apps/frontend/src/**/*.spec.ts`
- `apps/sprinthub-admin/vitest.config.ts`
- `apps/sprinthub-admin/src/**/*.spec.ts`

## Notas

- Priorizar lógica sobre renderização: teste de store e de camada de API dá muito mais retorno por linha escrita do que snapshot de template.
- Casa bem com a [Story 036](036-refatorar-appboard.md) — extrair a lógica do `AppBoard.vue` é o que torna esse componente testável.
- Não perseguir percentual de cobertura agora. O objetivo é ter onde pendurar o próximo teste, não um número.
