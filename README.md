<div align="center">
  <h1>🚀 SprintHub</h1>
  <p><strong>Plataforma SaaS de Gestão Ágil de Projetos e Times</strong></p>

  <p>
    <a href="#sobre-o-projeto">Sobre</a> •
    <a href="#arquitetura">Arquitetura</a> •
    <a href="#tecnologias">Tecnologias</a> •
    <a href="#features">Features</a> •
    <a href="#desenvolvimento-guiado-por-ia">IA Core</a> •
    <a href="#como-executar">Como Executar</a>
  </p>
</div>

## 📌 Sobre o Projeto

O **SprintHub** é uma plataforma SaaS (Software as a Service) completa para gestão de projetos ágeis. O sistema se propõe a resolver o desafio da organização do ciclo de desenvolvimento de software, oferecendo um ambiente centralizado para gerenciar empresas (tenants), times, projetos, sprints e tarefas (via Kanban).

Diferente de sistemas de gestão convencionais, o SprintHub foi concebido com uma fundação robusta Multi-Tenant e uma arquitetura moderna preparada para escala, além de integrar nativamente processos automatizados de engenharia de software guiados por Inteligência Artificial no seu próprio core de desenvolvimento.

---

## 🏗️ Arquitetura do Sistema

O projeto adota uma arquitetura em **Monorepo**, gerenciada pelo `pnpm workspaces`, promovendo reaproveitamento de código e facilidade de manutenção em múltiplas aplicações. 

A topologia do sistema está dividida da seguinte forma:

- **`apps/backend`**: Uma API RESTful robusta, desenvolvida em NestJS. Responsável por toda a regra de negócio, isolamento de dados das empresas (multi-tenancy) e segurança via AuthGuard e tokens JWT.
- **`apps/frontend`**: A interface (SPA) do cliente final (usuários e times), desenvolvida com Vue 3 e Vite. Fornece acesso aos Boards Kanban, Listas de Tarefas, Sprints e Perfis de forma rápida e reativa.
- **`apps/sprinthub-admin`**: Um painel de controle (Super Admin) para os donos da plataforma gerenciarem as assinaturas, empresas e monitorarem o uso geral da ferramenta.
- **`packages/shared`**: Módulo de códigos, tipagens TypeScript e utilitários compartilhados entre o frontend e o backend, garantindo que o contrato de dados seja uma única fonte de verdade.

---

## 💻 Stack de Tecnologias

A stack foi escolhida com foco em performance, tipagem estática rigorosa e alta produtividade:

**Backend:**
- [NestJS](https://nestjs.com/) - Framework Node.js progressivo para criar APIs eficientes e escaláveis.
- [Prisma ORM](https://www.prisma.io/) - Para modelagem de dados intuitiva e manipulação segura de banco de dados.

**Frontend:**
- [Vue.js 3](https://vuejs.org/) (Composition API) - Framework reativo adotado tanto na aplicação cliente quanto no Admin.
- [Vite](https://vitejs.dev/) - Ferramenta de build super otimizada.
- [Vue Router](https://router.vuejs.org/) - Roteamento no client-side.

**Infraestrutura & Ferramental:**
- **pnpm**: Gestão ágil das dependências do Monorepo.
- **Docker**: Orquestração de bancos e serviços auxiliares para o ambiente de desenvolvimento.

---

## ✨ Principais Features (MVP)

1. **Gestão Multi-Tenant:**
   - Isolamento total de dados por *Company* (Empresa).
   - Gerenciamento hierárquico: Empresa ➡️ Times ➡️ Projetos ➡️ Sprints ➡️ Tarefas.
2. **Segurança de Acesso:**
   - Autenticação e autorização robustas, controlando permissões de usuários através de Roles.
3. **Colaboração Ágil:**
   - Interface completa e interativa estilo *Kanban* para evolução fluida de tarefas no workflow.
4. **Governança:**
   - Dashboard exclusivo e independente (Super Admin) para visualização e gestão de tenants da plataforma.

---

## 🤖 Inovação: Desenvolvimento Guiado por IA (AIOS)

Um dos maiores diferenciais da engenharia de software aplicada a este projeto é o uso integrado do **Synkra AIOS (Codex CLI)**.

O repositório abriga seu próprio "sistema operacional de IA" na pasta `.aios-core/`. Diversos agentes autônomos especialistas (`@architect`, `@dev`, `@qa`, `@po`, etc) colaboram de forma padronizada respeitando regras inegociáveis de negócio e arquitetura (*Constitution*). Esse ecossistema garante:
- **Padrões de Código Constantes**: Análise e execução automática de *Quality Gates* (Lint, Typecheck, Testes).
- **Gestão de Requisitos Eficiente**: Agentes atuando exclusivamente sobre *Stories* bem documentadas em artefatos rastreáveis.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v20 ou superior)
- [pnpm](https://pnpm.io/) (v9 ou superior)
- Docker & Docker Compose (para subir a infraestrutura local rapidamente)

### Passos para inicialização

1. **Clone o repositório e acesse a pasta do projeto:**
   ```bash
   git clone <seu-repo-url>
   cd sprinthub
   ```

2. **Instale as dependências do Monorepo:**
   ```bash
   pnpm install
   ```

3. **Suba as instâncias locais via Docker Compose:**
   ```bash
   docker-compose up -d
   ```

4. **Inicie o ambiente de desenvolvimento:**
   ```bash
   pnpm run dev
   ```
   > Este comando executará todos os pacotes em paralelo (API, App Frontend e Super Admin). O ambiente estará pronto para acesso.

---
<div align="center">
  <p>Desenvolvido com dedicação, arquiteturas modernas e Inteligência Artificial colaborativa.</p>
</div>
