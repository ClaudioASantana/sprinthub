---
title: "Story 038 — MCP Server remoto e autenticado por tenant"
type: "story"
status: "todo"
priority: "high"
storyPoints: 8
projectId: "project-sprinthub-core"
---
# Story 038 — MCP Server remoto e autenticado por tenant

## Objetivo

Transformar o MCP Server de ferramenta local de desenvolvedor em capacidade de produto: acessível remotamente, autenticado, e com escopo restrito ao tenant de quem chamou.

## Contexto

Hoje `apps/backend/src/mcp-server/` roda por stdio, é iniciado na máquina do dev e fala **direto com o Postgres** — não passa por controller, guard ou regra de tenant. Ele enxerga todas as empresas: `list_projects` sem `companyId` devolve os projetos de todo mundo.

Como ferramenta local isso é aceitável (quem roda já tem a `DATABASE_URL`). Como produto, é inviável.

Este é o ativo mais diferenciado do repositório. Em 2026 os incumbentes estão correndo para isso — o Notion lançou agentes sobre MCP em fevereiro, o Jira lançou o Rovo. O SprintHub já tem 7 tools funcionando e testadas. O que falta não é a ideia, é a camada de confiança.

## Critérios de aceite

- [ ] Transporte HTTP (streamable) além do stdio, exposto pelo backend
- [ ] Autenticação por token de API com escopo de empresa, emitido e revogável pelo usuário
- [ ] `dispatchTool` recebe o contexto do tenant e **toda** consulta filtra por ele
- [ ] `list_projects` sem `companyId` passa a listar apenas os projetos da empresa do token — nunca de todas
- [ ] Tools passam a respeitar as permissões do papel do usuário dono do token
- [ ] Rate limit por token
- [ ] Toda chamada de tool registrada na auditoria com `actorType: 'agent'` ([Story 033](033-log-auditoria.md))
- [ ] `tools.spec.ts` estendido: token da empresa A não enxerga nem altera dado da empresa B
- [ ] Documentação de instalação para Claude Code / Cursor
- [ ] Modo stdio local preservado para desenvolvimento

## File list

- `apps/backend/src/mcp-server/tools.ts`
- `apps/backend/src/mcp-server/index.ts`
- `apps/backend/src/mcp-server/http-transport.ts`
- `apps/backend/src/mcp-server/tools.spec.ts`
- `apps/backend/src/api-tokens/`
- `docs/ai-integration-architecture.md`

## Notas

- Depende das Stories [031](031-isolamento-tenant-jwt.md) e [033](033-log-auditoria.md). O contexto de tenant e a trilha de auditoria são pré-requisito, não complemento.
- A refatoração de 01/09/2026 já separou `tools.ts` de `index.ts` justamente para permitir isto: a lógica das tools recebe o cliente por parâmetro e não tem efeito colateral de import. O ponto de injeção do tenant já existe.
- O cabeçalho de `index.ts` documenta o modelo de confiança atual — atualizar quando esta story entrar.
- Escrita por agente sem aprovação humana é o próximo problema: [Story 039](039-propor-e-aprovar-acoes-agente.md).
