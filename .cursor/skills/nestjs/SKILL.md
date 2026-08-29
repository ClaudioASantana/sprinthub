---
name: nestjs
description: >-
  Padrões NestJS do backend SprintHub (módulos, Prisma, JWT, CRUD). Use ao
  criar ou alterar código em apps/backend.
---

# NestJS (SprintHub Backend)

## Padrões

- Resource = module + service + controller no estilo de `apps/backend/src/tasks/`
- Prisma via `PrismaService`; schema em `apps/backend/prisma/schema.prisma`
- Auth: JWT + guards já existentes em `src/auth/`
- Validação de entrada alinhada aos DTOs do módulo vizinho

## Ao adicionar entidade

1. Atualizar Prisma schema + migration
2. Criar módulo Nest espelhando um módulo existente
3. Expor REST coerente com `/api/<resource>`
4. Garantir isolamento por tenant onde o domínio exigir
