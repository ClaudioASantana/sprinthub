---
title: "Story 033 — Log de auditoria"
type: "story"
status: "todo"
priority: "medium"
storyPoints: 5
projectId: "project-sprinthub-core"
---
# Story 033 — Log de auditoria

## Objetivo

Registrar quem fez o quê, quando e em qual empresa. Hoje não existe nenhum rastro: se um dado for alterado ou vazar, não há como reconstruir o que aconteceu.

## Contexto

Três motivos, em ordem de urgência:

1. **Resposta a incidente.** Enquanto a API esteve aberta (Stories 030–032), não há como saber se alguém leu ou alterou algo.
2. **LGPD.** Rastreabilidade de acesso a dado pessoal é requisito prático de qualquer contrato B2B sério no Brasil.
3. **Produto.** Quando um agente de IA passar a escrever no board ([Story 038](038-mcp-remoto-autenticado.md)), a trilha deixa de ser opcional: o usuário precisa ver o que o agente fez e conseguir desfazer.

## Critérios de aceite

- [ ] Model `AuditLog` no Prisma: `id`, `companyId`, `actorId`, `actorType` (user | agent | system), `action`, `entity`, `entityId`, `before`, `after`, `ip`, `userAgent`, `createdAt`
- [ ] Índices por `companyId + createdAt` e por `entity + entityId`
- [ ] Escrita automática via interceptor ou extensão do Prisma — não manual em cada service
- [ ] Mutações (create, update, delete) registradas em Project, Sprint, Task, User, Team, Company
- [ ] Campos sensíveis nunca gravados no diff (senha, token)
- [ ] Falha ao gravar auditoria não derruba a operação, mas gera log de erro
- [ ] Endpoint de leitura restrito a `admin` da própria empresa e a `super_admin`
- [ ] Política de retenção definida e documentada

## File list

- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/audit/audit.module.ts`
- `apps/backend/src/audit/audit.interceptor.ts`
- `apps/backend/src/audit/audit.controller.ts`

## Notas

- Depende da [Story 031](031-isolamento-tenant-jwt.md): sem `companyId` confiável no request, o log de auditoria também não é confiável.
- Guardar `before`/`after` como `Json`. Diff completo pesa; considerar gravar só os campos alterados.
