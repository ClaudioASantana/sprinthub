---
name: sprinthub
description: >-
  Product Owner / backlog do SprintHub — stories, priorização, sprints e
  critérios de aceite. Use ao criar ou priorizar stories, planejar sprint ou
  falar de backlog do produto.
---

# SprintHub Product Skill

## Quando usar

Criar/ajustar stories, priorizar backlog, planejar sprint ou alinhar aceite com `docs/stories/`.

## Stories

Formato preferido (já usado no repo):

```markdown
# Story NNN - Título

## Descrição
Como <papel>,
Quero <ação>,
Para <benefício>.

## Critérios de Aceite
- [ ] ...

## Technical Notes
- Endpoints / módulos / páginas afetados
```

Arquivos em `docs/stories/` com numeração sequencial.

## Domínio

- Hierarquia: Company → Team → Project → Sprint → Task
- Tipos de Task: `epic` | `story` | `task` | `bug`
- Backlog = tasks do projeto com `sprintId` null
- Status de execução: `todo` | `in_progress` | `done`

## Priorização

Se pedirem priorizar: MoSCoW ou valor/esforço simples; não inventar itens que não estejam em stories/issues/artefatos.
