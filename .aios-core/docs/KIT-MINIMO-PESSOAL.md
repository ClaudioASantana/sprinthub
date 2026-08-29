# Kit mínimo pessoal do AIOS Core

Kit enxuto para reaproveitar o que há de melhor no `.aios-core` sem carregar o framework inteiro.

## Objetivo

Este kit foi montado para uso prático de um desenvolvedor solo ou de um time pequeno que quer:

- escrever stories melhores;
- revisar entregas com mais disciplina;
- usar playbooks curtos para tarefas recorrentes;
- reaproveitar a filosofia do AIOS sem acoplamento pesado.

A ideia aqui não é reproduzir o framework, e sim extrair o que realmente ajuda no dia a dia.

---

## O que entrou no kit

### 3 templates
1. [`kit-minimo/templates/story-template.md`](kit-minimo/templates/story-template.md)
2. [`kit-minimo/templates/epic-template.md`](kit-minimo/templates/epic-template.md)
3. [`kit-minimo/templates/changelog-template.md`](kit-minimo/templates/changelog-template.md)

### 3 checklists
1. [`kit-minimo/checklists/story-pronta-para-desenvolver.md`](kit-minimo/checklists/story-pronta-para-desenvolver.md)
2. [`kit-minimo/checklists/definition-of-done.md`](kit-minimo/checklists/definition-of-done.md)
3. [`kit-minimo/checklists/pre-push.md`](kit-minimo/checklists/pre-push.md)

### 5 tasks úteis
1. [`kit-minimo/tasks/criar-proxima-story.md`](kit-minimo/tasks/criar-proxima-story.md)
2. [`kit-minimo/tasks/criticar-especificacao.md`](kit-minimo/tasks/criticar-especificacao.md)
3. [`kit-minimo/tasks/corrigir-rumo.md`](kit-minimo/tasks/corrigir-rumo.md)
4. [`kit-minimo/tasks/aplicar-ajustes-de-qa.md`](kit-minimo/tasks/aplicar-ajustes-de-qa.md)
5. [`kit-minimo/tasks/triar-issues-github.md`](kit-minimo/tasks/triar-issues-github.md)

---

## Critérios de seleção

Os itens acima foram escolhidos porque concentram o melhor custo/benefício do `.aios-core`:

- **story + epic + changelog** cobrem documentação operacional básica;
- **draft + DoD + pre-push** criam um fluxo mínimo de qualidade;
- **create next story + spec critique + correct course + QA fixes + issue triage** cobrem descoberta, execução, correção e priorização.

Ficaram de fora os elementos mais pesados do framework:

- runtime `core/`;
- validações por schema;
- automações dependentes de `core-config.yaml`;
- integrações ClickUp/MCP/CodeRabbit como obrigação.

---

## Como usar na prática

### Modo 1 — Solo enxuto
Use apenas:
- 1 template de story;
- 2 checklists (`story-pronta-para-desenvolver` e `definition-of-done`);
- 2 tasks (`criticar-especificacao` e `aplicar-ajustes-de-qa`).

Esse já é um fluxo excelente para projeto pequeno.

### Modo 2 — Operação organizada
Use tudo do kit quando você quiser:
- backlog mais disciplinado;
- stories autoexplicativas;
- revisão antes de push;
- correção de rumo documentada.

### Modo 3 — Base para seu método pessoal
Se o uso repetir bastante, este kit pode virar sua base para:
- padronizar vários repositórios;
- treinar agentes com o seu jeito de trabalhar;
- transformar tasks em playbooks próprios.

---

## Sequência recomendada de uso

1. Comece em `epic-template.md` quando o trabalho ainda está no nível macro.
2. Quebre a execução em `story-template.md`.
3. Passe a story no checklist `story-pronta-para-desenvolver.md`.
4. Antes de implementar, use `criticar-especificacao.md` se houver ambiguidade.
5. Ao terminar, rode `definition-of-done.md`.
6. Antes de subir código, passe em `pre-push.md`.
7. Se houver feedback ou mudança de direção, use `aplicar-ajustes-de-qa.md` ou `corrigir-rumo.md`.
8. Se o backlog crescer, use `triar-issues-github.md`.

---

## Leitura de origem

Este kit foi derivado principalmente de:

- `product/templates/story-tmpl.yaml`
- `product/templates/epic.hbs`
- `product/templates/changelog-template.md`
- `product/checklists/story-draft-checklist.md`
- `product/checklists/story-dod-checklist.md`
- `product/checklists/pre-push-checklist.md`
- `development/tasks/create-next-story.md`
- `development/tasks/spec-critique.md`
- `development/tasks/correct-course.md`
- `development/tasks/apply-qa-fixes.md`
- `development/tasks/triage-github-issues.md`

---

## Regra de ouro

Trate este kit como uma **caixa de ferramentas viva**:

- copie;
- simplifique;
- renomeie;
- adapte ao contexto do projeto.

O valor do `.aios-core` está menos em obedecer ao framework e mais em reaproveitar a disciplina certa, no tamanho certo.
