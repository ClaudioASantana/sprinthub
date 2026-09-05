---
title: "Story 032 — Autenticação real e bloqueio do dev-login em produção"
type: "story"
status: "done"
priority: "high"
storyPoints: 5
projectId: "project-sprinthub-core"
---
# Story 032 — Autenticação real e bloqueio do dev-login em produção

## Objetivo

Eliminar a emissão livre de token. Hoje `POST /api/auth/dev-login` é a chave-mestra do sistema, exposta sem autenticação.

## Contexto

Reproduzido em 01/09/2026 contra o backend local:

```
POST /api/auth/dev-login  {"email":"invasor@qualquer.com","role":"super_admin"}
  -> 200, JWT assinado, role=super_admin, profile=super_admin, companyId=company-demo-id

com esse token:
  GET /api/companies -> 200
  GET /api/projects  -> 200
  GET /api/stats     -> 200
```

Sem senha. O endpoint cria a empresa se não existir e assina `profile: 'super_admin'` sempre que o body pede. Isso torna as Stories 030 e 031 inúteis se ficar de pé: não adianta trancar a porta se o cadeado imprime chaves.

O `dev-login` nasceu como andaime enquanto o Go Auth não estava integrado, e virou o fluxo real — a `LoginPage.vue` usa ele.

## Critérios de aceite

- [x] `dev-login` retorna 404 quando `NODE_ENV === 'production'`
- [x] Mesmo em dev, `dev-login` só aceita e-mails de usuários **já existentes** — não cria empresa nem usuário
- [x] `role` e `profile` vêm do registro no banco, nunca do body da requisição
- [x] Fluxo OAuth com o Go Auth — código pronto ponta a ponta (login → callback → JWT → sessão); **validação E2E bloqueada** (ver Notas)
- [x] `GO_REDIRECT_URI` documentado no `.env.example` com o prefixo `/api` correto
- [x] Rate limit nos endpoints de autenticação (`@nestjs/throttler`)
- [x] `JWT_SECRET` obrigatório na subida — a aplicação falha ao iniciar se estiver ausente ou for o valor de exemplo
- [x] Token com expiração curta (`JWT_ACCESS_EXPIRES_IN`, default 15m) + refresh token opaco com revogação/rotação (tabela `RefreshToken`, default 30 dias)
- [x] `LoginPage.vue` usa o fluxo real; o botão de dev fica visível só em desenvolvimento (`import.meta.env.DEV`)

## File list

- `apps/backend/prisma/schema.prisma` — model `RefreshToken`
- `apps/backend/prisma/seed.ts` — usuário `admin@sprinthub.com` (`super_admin`)
- `apps/backend/src/auth/jwt-secret.util.ts` (novo)
- `apps/backend/src/auth/jwt-secret.util.spec.ts` (novo)
- `apps/backend/src/main.ts`
- `apps/backend/src/auth/auth.controller.ts`
- `apps/backend/src/auth/auth.service.ts`
- `apps/backend/src/auth/auth.module.ts`
- `apps/backend/src/auth/dto/auth.dto.ts`
- `apps/backend/src/app.module.ts` — `ThrottlerModule`/`ThrottlerGuard` global
- `apps/backend/.env.example`
- `apps/backend/test/dev-login.e2e-spec.ts` (novo)
- `apps/backend/test/refresh-token.e2e-spec.ts` (novo)
- `apps/frontend/src/utils/api.ts` (novo)
- `apps/frontend/src/router/index.ts`
- `apps/frontend/src/pages/LoginPage.vue`
- `apps/frontend/src/pages/AuthCallback.vue`
- `apps/sprinthub-admin/src/pages/LoginView.vue`

## Notas

- **Bloqueado:** validação E2E real do fluxo OAuth com o Go Auth. O código do callback (`tenant-callback` → JWT → sessão) está pronto e sem alterações de comportamento nesta story, mas o provedor em `GO_AUTH_URL=http://localhost:8081/api/v1` não estava no ar em 01/09/2026, e registrar a redirect URI no client do provedor é fora deste repo. Retomar quando o Go Auth estiver disponível.
- **Refresh token:** decisão consciente por tabela no Postgres (hash SHA-256 do token, nunca texto puro) em vez de JWT stateless — permite revogar (`POST /auth/logout`) e detectar reuso de token já rotacionado. Vale hoje só para tokens emitidos por este backend (`dev-login`); tokens do Go Auth têm ciclo de vida próprio.
- **Frontend:** o refresh entra só no gate de autenticação do router (`requireAuth` em `router/index.ts`, via `utils/api.ts::ensureFreshToken`) — não foi feito refactor das páginas que já fazem `fetch` direto com `localStorage.getItem('token')`; elas continuam funcionando porque o router reescreve a mesma chave `token` antes de navegar.
- **Super admin em dev:** `admin@sprinthub.com` agora existe de verdade no seed (`role: super_admin`), então os botões de dev-login (`LoginPage.vue`, `sprinthub-admin/LoginView.vue`) continuam funcionando com `role`/`profile` vindos do banco.
- Verificado: `npm run test` (41 testes) e `npm run test:e2e` (32 testes, 5 suites) verdes no backend; `tsc --noEmit` e `vue-tsc --noEmit` limpos nos três apps; checagem manual via `curl` confirmou 401 (e-mail inexistente), 404 (`NODE_ENV=production`) e 429 (rate limit após 5 chamadas/60s).
- O `GO_REDIRECT_URI` já foi corrigido para `http://localhost:3005/api/auth/callback` no `.env.example` (faltava o prefixo `/api`, o que dava 404 no callback).
- Ver [Story 009](009-autenticacao-usuarios.md), que originou o `dev-login`.
