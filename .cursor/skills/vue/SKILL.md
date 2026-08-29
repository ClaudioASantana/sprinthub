---
name: vue
description: >-
  Padrões Vue 3 do SprintHub (pages, router, services, Kanban). Use ao criar
  ou alterar código em apps/frontend ou apps/sprinthub-admin.
---

# Vue 3 (SprintHub Frontend)

## Padrões

- `<script setup>` + Composition API
- Nova página: componente em pages + rota no router
- API: serviço em `src/services` (ou equivalente) com base URL via env/proxy
- Forms: loading/error states como nas telas existentes

## Kanban / Tasks

- Board filtra sprint atual vs product backlog (`sprintId` null)
- Assignees vêm dos membros da equipe / users da company
