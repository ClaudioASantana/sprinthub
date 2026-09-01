---
title: "Story 032 — Autenticação real e bloqueio do dev-login em produção"
type: "story"
status: "todo"
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

- [ ] `dev-login` retorna 404 quando `NODE_ENV === 'production'`
- [ ] Mesmo em dev, `dev-login` só aceita e-mails de usuários **já existentes** — não cria empresa nem usuário
- [ ] `role` e `profile` vêm do registro no banco, nunca do body da requisição
- [ ] Fluxo OAuth com o Go Auth funcionando ponta a ponta (login → callback → JWT → sessão)
- [ ] `GO_REDIRECT_URI` documentado no `.env.example` com o prefixo `/api` correto
- [ ] Rate limit nos endpoints de autenticação (`@nestjs/throttler`)
- [ ] `JWT_SECRET` obrigatório na subida — a aplicação falha ao iniciar se estiver ausente ou for o valor de exemplo
- [ ] Token com expiração curta + refresh token
- [ ] `LoginPage.vue` usa o fluxo real; o botão de dev fica visível só em desenvolvimento

## File list

- `apps/backend/src/auth/auth.controller.ts`
- `apps/backend/src/auth/auth.service.ts`
- `apps/backend/src/auth/auth.module.ts`
- `apps/backend/src/main.ts`
- `apps/backend/.env.example`
- `apps/frontend/src/pages/LoginPage.vue`

## Notas

- **Atenção ao efeito colateral:** isso muda o fluxo de login local. Fazer com o browser aberto, validando cada passo.
- O `GO_REDIRECT_URI` já foi corrigido para `http://localhost:3005/api/auth/callback` no `.env.example` (faltava o prefixo `/api`, o que dava 404 no callback). Falta registrar essa URI nas redirect URIs permitidas do client no provedor Go Auth — **isso é fora deste repo**.
- O provedor em `GO_AUTH_URL=http://localhost:8081/api/v1` não estava no ar em 01/09/2026.
- Ver [Story 009](009-autenticacao-usuarios.md), que originou o `dev-login`.
