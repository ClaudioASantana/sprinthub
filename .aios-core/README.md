# .aios-core

Visão geral rápida da infraestrutura local de desenvolvimento orientada por IA usada neste repositório.

## O que é

O `.aios-core` funciona como um **framework operacional para agentes, templates, workflows e integrações de desenvolvimento**. Ele não representa uma feature do produto SprintHub; seu papel é apoiar processo, governança e automação do trabalho com IA.

## Onde começar

- Visão geral e análise: [`docs/AIOS-CORE-OVERVIEW.md`](docs/AIOS-CORE-OVERVIEW.md)
- Uso pessoal recomendado: [`docs/AIOS-CORE-PARA-USO-PESSOAL.md`](docs/AIOS-CORE-PARA-USO-PESSOAL.md)
- Módulo central: [`core/README.md`](core/README.md)
- Desenvolvimento/agentes/workflows: [`development/README.md`](development/README.md)
- Integrações e tooling: [`infrastructure/README.md`](infrastructure/README.md)
- Templates/checklists de produto: [`product/README.md`](product/README.md)
- Scripts legados e migração: [`scripts/README.md`](scripts/README.md)
- Padrões e normas: [`docs/standards/`](docs/standards/)

## Estrutura resumida

- `core/` — runtime central, sessão, configuração e elicitação
- `development/` — agentes, teams, tasks, workflows e scripts de apoio
- `infrastructure/` — tooling, adapters, integrações e utilitários base
- `product/` — templates, checklists e artefatos de processo
- `docs/` — documentação e padrões
- `data/` — registries, patterns e knowledge base
- `scripts/` — scripts legados / compatibilidade
- `workflow-intelligence/` — padrões e execução inteligente de workflows

## Nota prática

Se a dúvida for “por que isso está aqui?”, a resposta curta é:

> para apoiar o fluxo de desenvolvimento com IA (agents/skills/templates/workflows), e não para compor o runtime do produto SprintHub.
