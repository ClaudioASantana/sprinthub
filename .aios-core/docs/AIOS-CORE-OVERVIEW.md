# AIOS Core Overview

## O que é o `.aios-core`

O `.aios-core` neste repositório **não é uma feature do produto SprintHub** nem uma dependência de runtime do SaaS. Ele se comporta como uma **infraestrutura local de desenvolvimento orientada por IA**, reunindo:

- orquestração de agentes/personas;
- templates de artefatos (stories, épicos, documentos);
- workflows de desenvolvimento;
- elicitação de requisitos;
- validações, quality gates e schemas;
- integrações com ferramentas externas (incluindo MCP/PM tools);
- utilitários de sessão, contexto e execução.

Em uma frase: o `.aios-core` se propõe a ser um **framework operacional para times usando agentes de IA no desenvolvimento de software**.

## O que ele se propõe a fazer

A partir da estrutura atual e dos READMEs dos módulos, o `.aios-core` busca cobrir seis frentes principais:

### 1. Orquestração de agentes
Sustentar personas e papéis especializados como `architect`, `pm`, `qa`, `dev`, `po`, etc., além de composições em times de agentes.

### 2. Templates e geração guiada
Fornecer templates e checklists para criar stories, épicos, PRDs, documentos técnicos e outros artefatos de produto/desenvolvimento.

### 3. Workflows e processos
Padronizar fluxos como greenfield/brownfield, handoffs, checks de qualidade e execução orientada por tarefas.

### 4. Elicitação de requisitos
Ajudar agentes a coletar contexto antes de agir, por meio de fluxos de elicitação para tarefas, workflows e configurações de agentes.

### 5. Governança e validação
Validar estruturas, schemas, padrões de saída e disciplinar o uso de ferramentas e integrações.

### 6. Integração com tooling
Servir de base para scripts, hooks, registries de ferramentas, padrões de MCP e adapters de PM tools (ex.: GitHub Projects, Jira, ClickUp).

## O que ele **não** parece ser

- não parece ser parte do runtime do SprintHub;
- não parece ser uma biblioteca de domínio do produto;
- não parece ser necessário para o app rodar localmente via `pnpm run dev`.

Ele está muito mais próximo de um **framework interno de engenharia assistida por IA** do que de uma dependência do SaaS.

## Organização atual da pasta

A estrutura hoje está distribuída em módulos e camadas:

### `core/`
Módulo central de runtime do framework.

Responsabilidades principais:
- configuração;
- sessão e contexto;
- elicitação;
- utilitários centrais;
- documentação interna do framework.

### `development/`
Ativos orientados ao fluxo de desenvolvimento.

Responsabilidades principais:
- definições de agentes;
- times de agentes;
- tasks;
- workflows;
- scripts de apoio ao desenvolvimento.

### `infrastructure/`
Camada base de integrações e tooling.

Responsabilidades principais:
- scripts de git/config;
- adapters de PM tools;
- integrações externas;
- resolução de ferramentas;
- validações infra.

### `product/`
Ativos estáticos para produto/processo.

Responsabilidades principais:
- templates;
- checklists;
- dados de apoio a PM/PO;
- convenções de artefatos.

### `docs/`
Documentação de padrões e material normativo do framework.

### `data/`
Knowledge base, registries, patterns, schemas operacionais e regras auxiliares.

### `scripts/`
Diretório legado / ponte de migração. O próprio README indica que a maior parte dos scripts ativos já foi movida para os módulos acima.

### `workflow-intelligence/`
Camada voltada a padrões e execução inteligente de workflows.

## Leitura prática para este repositório

No contexto do SprintHub, a parte realmente visível e útil do `.aios-core` parece ser:

- templates e padrões de story;
- governança leve de agentes;
- convenções de trabalho orientadas por backlog;
- atalhos/personas e skills do ambiente de desenvolvimento.

Já a maior parte do framework parece ser **infra compartilhada/herdada**, possivelmente trazida de outro projeto/processo mais amplo.

## O que faz sentido reaproveitar em outros projetos

### Aproveitável
- disciplina de stories e critérios de aceite;
- checklists de validação;
- guias leves para agentes;
- templates de documentação e backlog;
- integração com GitHub Projects / PM tools quando houver uso real.

### Trazer com cautela
- workflows genéricos demais;
- orquestração pesada de agentes;
- validações e hooks que aumentem a complexidade sem necessidade;
- toda a pasta `.aios-core` como dependência padrão de projetos pequenos.

## Conclusão

O `.aios-core` é melhor entendido como um **meta-framework de desenvolvimento com IA**, e não como parte do produto SprintHub. Seu valor principal está em organizar processo, agentes, templates e integrações. Em projetos mais enxutos, costuma valer mais a pena reaproveitar **a filosofia e os artefatos leves** do que copiar o framework inteiro.
