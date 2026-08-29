# AGENTS.md — SprintHub

Instruções para agentes de IA neste repositório (Cursor).

## Core

1. Trabalhe por stories em `docs/stories/`. É **OBRIGATÓRIO** que cada arquivo tenha o cabeçalho YAML (Frontmatter) contendo metadados (title, type, status, priority, etc).
2. Não invente requisitos fora dos artefatos em `docs/`
3. Respeite multi-tenancy (isolamento por Company)
4. Regras detalhadas: `.cursor/rules/` — skills: `.cursor/skills/`

## Quality gates

- `pnpm run lint`
- testes do(s) pacote(s) afetado(s)
- Atualize checklist da story antes de concluir

## Project map

- `apps/backend` — NestJS + Prisma
- `apps/frontend` — Vue 3 (tenant)
- `apps/sprinthub-admin` — Vue 3 (super-admin)
- `docs/` — arquitetura, status e stories

## Commands

```bash
pnpm install
docker compose up -d
pnpm run dev
```

## Skills úteis

- `sprinthub` — backlog / stories / aceite
- `nestjs` — backend
- `vue` — frontend
