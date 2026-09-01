---
title: "Story 034 — Pipeline de CI"
type: "story"
status: "in_progress"
priority: "high"
storyPoints: 2
projectId: "project-sprinthub-core"
---
# Story 034 — Pipeline de CI

## Objetivo

Rodar lint, typecheck e testes automaticamente em todo push e pull request. Hoje não existe `.github/workflows/` — nada impede que uma regressão entre na `main`.

## Contexto

O `AGENTS.md` define os quality gates (`pnpm run lint` + testes do pacote afetado), mas eles dependem de alguém lembrar de rodar. Sem CI, as correções de segurança das Stories 030–032 podem ser desfeitas na semana seguinte sem ninguém perceber.

É a story de menor esforço e maior retorno da lista: um arquivo protege todo o resto.

## Critérios de aceite

- [x] Workflow em `.github/workflows/ci.yml` disparado em `push` na `main` e na `develop`, e em `pull_request`
- [x] Job com Node 22 + pnpm 11 e cache de dependências
- [x] Passos: `pnpm install --frozen-lockfile` → lint → testes → build
- [x] Lint no CI roda **sem `--fix`** (o script `lint` local usa `--fix` e reescreve arquivos; no CI ele precisa falhar, não corrigir)
- [x] `prisma generate` antes do lint e do build do backend
- [x] Build do backend e dos dois frontends valida que o `dist/` sai
- [x] Badge de status no `README.md`
- [ ] Confirmar execução verde no GitHub Actions após o push

## File list

- `.github/workflows/ci.yml`
- `package.json` (script `lint:ci`)
- `apps/backend/package.json` (script `lint:ci`)
- `apps/backend/src/projects/projects.service.ts` (correção dos erros de lint)
- `README.md`

## Notas

- Serviço de Postgres no workflow só será necessário quando existirem testes e2e que tocam o banco (Stories 030 e 031). Deixar preparado.
- O CI **não** dispara deploy. Em 01/09/2026 o repo não tinha webhook e o deploy no Coolify é manual/por API — manter assim até haver ambiente de staging.

### Desvios do plano original

- **Node 22, não 20.** O `engines` pede `>=20` e a máquina de desenvolvimento roda 22.23.2. CI numa versão menor que a de desenvolvimento esconde problema em vez de achar.
- **Typecheck não virou passo próprio.** O backend já typecheca via `nest build` e os frontends via `vue-tsc -b` dentro do `build`. Passo separado só repetiria o trabalho.
- **`prisma generate` roda com `--filter backend`, não na raiz.** A raiz tem `prisma@8.0.0-rc.12` como devDependency e o backend usa `@prisma/client@5.22.0`. Rodar da raiz pegaria o RC da 8. Ver Notas abaixo.

### Correções necessárias para o CI passar

O `eslint` sem `--fix` acusava **4 erros** (`no-unsafe-return`) e 16 warnings — ou seja, o CI nasceria vermelho. Como `--fix` não corrige esses erros, eles já estavam lá e passavam despercebidos porque ninguém rodava o lint sem `--fix`.

Todos em `projects.service.ts`, mesma causa: `res.json()` da API GraphQL do GitHub devolve `any`, e o `any` vazava para `json.errors.map((e: any) => e.message)`. Corrigido com o tipo `GithubGraphqlResponse`, tipando `errors` e o retorno de `githubGraphql`.

Um deles (linha 965) exigiu anotação explícita no `const json`, porque o ternário de dois `await githubGraphql(...)` estava alargando para `any`. Resultado: **0 erros, 14 warnings**, exit 0.

Os 14 warnings restantes são todos `no-unsafe-argument` e **não** bloqueiam o CI. Ainda não vale ligar `--max-warnings 0`: a maior parte deles está em controllers que as Stories [030](030-guard-global-autenticacao.md) e [031](031-isolamento-tenant-jwt.md) vão reescrever de qualquer jeito. Ligar o gate depois delas.

### Dívida encontrada de passagem

A raiz declara `prisma@8.0.0-rc.12` (release candidate) enquanto o backend usa `@prisma/client@5.22.0`. Hoje não quebra porque `npx prisma` dentro de `apps/backend` resolve a 5.22.0 — mas `npx prisma` **na raiz** pega a 8.0.0-rc. Risco real em comando de migration rodado do lugar errado. Vale alinhar as versões numa story própria.
