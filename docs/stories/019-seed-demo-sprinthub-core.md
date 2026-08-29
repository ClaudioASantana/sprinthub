---
title: "Story 019 - Seed Demo “SprintHub Core” (Dados Realistas)"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-1"
---
# Story 019 - Seed Demo “SprintHub Core” (Dados Realistas)

## Descrição
Como Desenvolvedor ou Product Owner em ambiente local/demo,
Quero um seed rico com um projeto dogfood (“SprintHub Core”) contendo sprints, tasks e assignees,
Para abrir o app e em poucos minutos visualizar hub, backlog e board como em uma ferramenta de acompanhamento real.

## Critérios de Aceite
- [x] `prisma/seed.ts` cria (idempotente via upsert) o cenário **SprintHub Core**:
  - 1 Company demo (pode reutilizar `company-demo-id`)
  - 1 Team com ≥ 2 members/users
  - 1 Project `SprintHub Core` (id estável, ex.: `project-sprinthub-core`)
  - ≥ 2 Sprints: um **passado** (fechado) e um **atual** (ativo)
  - ≥ 15 Tasks misturando `epic` / `story` / `task` / `bug`, com `priority` e `storyPoints`
  - Parte das tasks no backlog (`sprintId = null`), parte no sprint atual, parte done no sprint passado
  - Assignees distribuídos entre os users do time
- [x] Após `pnpm`/`npx prisma db seed` (ou script documentado), login demo + navegação levam ao board/hub com dados visíveis.
- [x] Seed **não quebra** reexecução (segunda rodada não duplica entidades-chave).
- [x] Documentar no README ou em `docs/` o comando de seed e os IDs/credenciais demo relevantes.
- [x] (Dev) Botão ou script opcional **“Reset demo”** que reaplica o seed do cenário (somente em `NODE_ENV !== production`) — aceitável como endpoint admin ou npm script; não expor em produção.
- [x] As tasks do seed podem espelhar o próprio roadmap (016–024) como títulos, para dogfood do backlog do produto.

## Technical Notes
- Arquivo: `apps/backend/prisma/seed.ts` (const `DEMO` com IDs estáveis).
- Projeto Alpha (`project-1`) mantido para compat; dogfood principal = `project-sprinthub-core`.
- Comandos: `make db-seed` | `make db-init` | `pnpm --filter backend db:seed` | `pnpm --filter backend db:reset-demo` (reaplica upserts).
- Deep link: `/app/project/project-sprinthub-core`
- Users: `po@demo.com`, `dev1@demo.com`, `dev2@demo.com`
- Fora de escopo: sync GitHub; UI de onboarding completa.
