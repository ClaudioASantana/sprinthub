# SprintHub - Contexto & Próximos Passos (Handoff)

> Este arquivo centraliza o contexto onde paramos para que possamos retomar facilmente quando você abrir a pasta raiz do `sprinthub` no seu novo Workspace.

## 📌 Estado Atual
Toda a infraestrutura do **Monorepo (pnpm)** já foi gerada com sucesso:
- `apps/frontend/` -> Aplicação Vue instanciada usando o Vite-cli (Vue-ts, Router, Pinia, ESLint).
- `apps/backend/` -> Backend instanciado usando o NestJS CLI oficial.
- `packages/shared/` -> Pasta base para receber nossos contratos de tipagem e interfaces entre back e front.
- `docs/` -> Estruturado para o SDD@(`stories/`, `specs/`, e `architecture/initial-implementation-plan.md`).
- `AIOS (.aios-core & AGENTS.md) -> A sua infraestrutura de Agentes foi clonada da agência para cá com sucesso.
---

## �@ Como Retomar no Novo Workspace?

### Passo 1: Inicialize o projeto
Abra um terminal na raiz (`/home/amorim/repos/sprinthub`) e rode:
``bash
pnpm install
```
*Isso fará o lockfile inicial do monorepo ser criado e baixará em paralelo todas as dependências do NestJS e Vue unificando por hard-links.*
### Passo 2: Teste básico
Se quiser validar que a infra base respira:
```bash
pnpm -r --parallel dev
```

### Passo 3: Criar nossa Primeira Story (SDD)
Inicie uma nova conversa comigo (ou referencie o `@pm` / `@architect`) e diga:
> *"Vamos começar a primeira story do SprintHub."*

Criaremos o primeiro arquivo dentro de `docs/stories/`, definindo o domínio central da nossa aplicação (por exemplo, "Gestão de Equipes" ou "Autenticação Core") antes de colocar a mão em regras de negócio no backend ou templates no Vue!
