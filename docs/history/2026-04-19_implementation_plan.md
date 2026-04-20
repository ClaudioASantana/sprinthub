# Goal: Story 015 - Visão Geral e Indicadores (Dashboard Home)

Atualmente nosso Kanban e nossas Tabelas estão excelentes, porém a porta de entrada do usuário (`DashboardOverview.vue`) não possui vida própria. Ela faz um pedido fantasma em `/api/stats` que quebra e consequentemente exibe números chumbados estatísticos que nunca mudam.
Nosso objetivo aqui é entregar o impacto visual de um SaaS ao dar números genuínos e em *Realtime* sobre os resultados do negócio.

## Proposed Changes

### Backend APIs (`apps/backend/src/...`)
Vamos construir o endpoint que conta os resultados do Tenant (Empresa) via Prisma.
#### [NEW] `apps/backend/src/app.controller.ts` (ou criar módulo de stats nativo em `stats.controller.ts`)
- Mapear a rota `GET /api/stats?companyId=XYZ`. Se `companyId` for passado, filtramos, caso contrário enviamos os globais da Plataforma (se o usuário for root/admin).
- Faremos 4 Queries em paralelo com `Promise.all` e a instrução analítica nativa do prisma `prisma.model.count({ where })`:
  - `companies`: Quantas empresas ativas.
  - `projects`: Quantos projetos ativos.
  - `sprints`: Total de ciclos em progresso ou finalizados.
  - `tasks`: Volume bruto de trabalho criado ali dentro.

### Frontend UI (`apps/frontend/src/pages/DashboardOverview.vue`)
#### [MODIFY] `DashboardOverview.vue`
- Remover os dados 'mocked' e aplicar tratamento de *Skeleton Loaders* (um brilho animado) enquanto o fetch não resolve a promise real.
- Embelezar a UI e adicionar validação de JWT, usando uma interface moderna para o Dashboard principal.
- Acabar de uma vez por todas com o `companyId=1` chumbado; o Overview deve ser reativo. No Front, criaremos lógica pra recuperar dados do Tenant, mas temporariamente injetaremos a string da empresa atual de modo fluido.

## User Review Required

> [!CAUTION]  
> Você concorda em implementarmos esse Dashboard Geral para tirarmos a sensação de dados falsos na entrada principal do usuário? 
> Isso provará que todo nosso esforço em `Projects`, `Sprints` e o `Kanban Inteligente` estão finalmente gerando relatórios de volume consolidados!
