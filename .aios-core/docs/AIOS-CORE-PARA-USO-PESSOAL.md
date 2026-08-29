# AIOS Core para uso pessoal

Guia prático para usar o `.aios-core` como desenvolvedor, sem precisar adotar o framework inteiro de uma vez.

## Ideia central

O `.aios-core` tende a gerar mais valor quando é usado como **caixa de ferramentas de processo e colaboração com IA** do que como dependência obrigatória de runtime dos seus projetos.

Em vez de perguntar “como plugar isso no app?”, a melhor pergunta costuma ser:

> como usar esse acervo para me ajudar a pensar melhor, estruturar melhor e executar com mais consistência?

---

## Use já

Estas partes parecem úteis de forma imediata, mesmo em projetos pequenos ou solo.

### 1. `product/templates/`
Use para acelerar documentação e backlog.

Pode servir como fonte para:
- stories;
- épicos;
- PRDs;
- arquitetura;
- changelog;
- templates de CI/CD e convenções de IDE.

**Bom uso pessoal:** copiar/adaptar só os templates necessários para cada projeto.

### 2. `product/checklists/`
Use como Definition of Done, revisão e disciplina de entrega.

Arquivos com valor prático evidente:
- `story-dod-checklist.md`
- `story-draft-checklist.md`
- `pm-checklist.md`
- `architect-checklist.md`
- `pre-push-checklist.md`
- `release-checklist.md`

**Bom uso pessoal:** montar um fluxo simples de “antes de considerar pronto, passar por checklist”.

### 3. `development/tasks/`
Use como catálogo de operações recorrentes para agentes e trabalho assistido por IA.

Há mais de 200 tasks, incluindo exemplos de:
- revisão QA;
- crítica de especificação;
- dry-run de banco;
- rollback;
- merge de worktree;
- triagem de issues;
- correção de rumo.

**Bom uso pessoal:** escolher algumas tasks úteis e tratá-las como playbooks, não como obrigação global.

### 4. `development/README.md`
Use para entender o modelo mental de papéis, agentes, teams e workflows.

**Bom uso pessoal:** separar mentalmente os papéis que você já exerce — produto, arquitetura, implementação, QA — e usar isso para estruturar melhor o trabalho com IA.

### 5. `docs/standards/`
Use como referência de padrões quando precisar formalizar processo, qualidade ou formato de artefatos.

**Bom uso pessoal:** consultar quando estiver desenhando um fluxo seu; evitar importar tudo de uma vez.

---

## Ignore por enquanto

Estas partes só valem a pena quando houver uso real e repetido.

### 1. `core/`
O módulo `core` parece ser o runtime do framework: configuração, elicitação, sessão, utilitários e APIs próprias.

**Ignore por enquanto se:**
- você não vai desenvolver em cima do próprio framework;
- você só quer melhorar seu processo pessoal;
- seus projetos não precisam de uma engine própria de agentes.

### 2. `schemas/`
Tem schemas e validadores para agents, squads e tasks.

**Ignore por enquanto se:**
- você ainda não versiona agentes/squads/tasks como artefatos formais;
- não precisa validar YAML/JSON de forma rígida.

### 3. `workflow-intelligence/`
Parece ser uma camada para execução inteligente de workflows.

**Ignore por enquanto se:**
- seus workflows ainda são simples o suficiente para docs + checklists + board.

### 4. grande parte de `scripts/`
O próprio README indica que esse diretório é legado/migração em boa parte.

**Ignore por enquanto se:**
- você não está migrando o framework;
- só quer reaproveitar a disciplina, não a estrutura interna.

---

## Talvez evoluir depois

Estas partes podem se tornar úteis se você decidir montar um sistema pessoal mais sofisticado de engenharia com IA.

### 1. `development/agents/` e `development/agent-teams/`
Se você passar a usar IA com papéis recorrentes e bem distintos, isso pode virar um sistema pessoal valioso.

**Vale evoluir depois se:**
- você trabalha em vários projetos;
- quer separar melhor PO/PM/QA/Architect/Dev;
- quer reduzir improviso em tarefas complexas.

### 2. `infrastructure/`
Tem adapters de PM tools, resolução de ferramentas, integrações e automação infra.

**Vale evoluir depois se:**
- você quiser padronizar interação com GitHub Projects, Jira, ClickUp ou MCPs;
- você começar a manter automações compartilhadas entre vários repositórios.

### 3. `core/elicitation` e `elicitation/`
Pode ser útil se você quiser formalizar fluxos de descoberta/clarificação antes de implementar.

**Vale evoluir depois se:**
- você frequentemente começa trabalho com requisitos nebulosos;
- quer sistematizar discovery guiado por IA.

---

## Como eu usaria isso na prática

### Nível 1 — Leve
Usaria apenas:
- templates;
- checklists;
- stories em markdown;
- um guia curto de agentes por projeto.

Esse é o ponto de melhor custo/benefício para a maioria dos projetos.

### Nível 2 — Intermediário
Além do nível 1:
- escolher alguns papéis recorrentes (ex.: PO, architect, QA, dev);
- reaproveitar tasks recorrentes como playbooks;
- padronizar backlog, aceite e validação entre projetos.

Bom para quem toca vários projetos ao mesmo tempo.

### Nível 3 — Avançado
Além dos anteriores:
- operar em cima de `core/`, `schemas/`, `infrastructure/` e `workflow-intelligence`;
- transformar o AIOS em um ecossistema pessoal de engenharia com IA.

Só vale se houver adoção real e necessidade de escala de processo.

---

## Recomendação objetiva

Se você for usar o `.aios-core` para si, a estratégia mais saudável é:

1. tratar o `.aios-core` como **repositório mestre de práticas**;
2. extrair apenas o necessário para cada projeto;
3. evitar acoplamento imediato ao framework inteiro;
4. só investir nas camadas pesadas quando o uso se repetir bastante.

Em resumo:

- **use já:** templates, checklists, stories, tasks como playbooks;
- **ignore por enquanto:** runtime core, schemas, inteligência de workflow e legado;
- **evolua depois:** agents/teams, integrations e elicitation, se o volume de uso justificar.
