# SprintHub - Status Geral do Projeto

> Este documento centraliza o overview exato de onde estamos parados no desenvolvimento global do projeto (Handoff Atualizado).

### 1. Infraestrutura Monorepo (Pilar Central) ✅
Toda a base do repositório já foi orquestrada com `pnpm workspaces`. Isso significa que os pacotes e aplicações já "conversam" entre si no ambiente de desenvolvimento compartilhando dependências pesadas sem duplicar coisas na máquina. O ambiente do **AIOS (Codex CLI)** com suas Constituições e Guias de Qualidade também já está inserido na infra (`.aios-core/`), garantindo que o desenvolvimento siga o padrão rigoroso.

### 2. O Backoffice / Painel Administrativo ("A Sala de Máquinas") 🚧
Este é o `apps/sprinthub-admin` (Painel Web em Vue 3).
Finalizamos o bloqueio por JWT integrado via **Gestão de Acesso (Go)** (atuando como nosso servidor central de IAM), e garantimos que apenas o `super_admin` acesse. Nós também construímos o **Layout Master (App Shell)** com as rotas filhas encapsuladas, deixando a infraestrutura de tela preparada para começar a receber formulários pesados de CRUD.

### 3. As Engrenagens do Produto Final (O "Miolo" do SaaS) ⏳
As duas peças que os clientes finais irão utilizar ainda estão "virgens", apenas com a fundação crua inicializada:
- **`apps/backend`**: Uma instância em **NestJS** pronta para começar a receber os primeiros Endpoints e validações.
- **`apps/frontend`**: O frontend em **Vue**, com Vite, Router e Pinia configurados para suportar o fluxo de produto real das empresas no dia a dia.
  
A próxima grande história descrita e priorizada dessa área de negócios diz respeito à **Autenticação Core / Gestão de Equipes**.

### 4. Pacotes Auxiliares 📦
A fundação do **`packages/shared`** está pronta. Ela servirá como o repositório central para abrigar entidades e dicionários compartilhados em Typescript (ex: `IUser`, `ITeam`). Dessa forma, tanto o frontend dos clientes quanto o backend NestJS utilizarão as mesmas interfaces para comunicação e validação, mantendo total integridade dos tipos em ambos os domínios.
