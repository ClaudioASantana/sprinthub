# SprintHub - Bootstrapping Architecture

O objetivo deste plano é inicializar o repositório Monorepo para o projeto **SprintHub** na raiz `/home/amorim/repos/sprinthub`. 
Dessa forma, isolamos a ferramenta da "Agência", permitindo que ela gerencie múltiplos projetos como uma plataforma (ou SaaS) independente. Além disso, criaremos a estrutura ideal para acoplar o seu processo de **Spec Driven Development (SDD)**.

## Proposed Changes

A estrutura proposta focará em separar as aplicações reais dos pacotes compartilhados e da documentação.

### 1. Documentação (Coração do SDD)
Aqui é onde o projeto nasce antes do código.
- [NEW] `/home/amorim/repos/sprinthub/docs/stories/` (Onde você vai guardar os cenários de uso/épicos).
- [NEW] `/home/amorim/repos/sprinthub/docs/specs/` (Onde as *Specs* técnicas e PRDs que eu e você criaremos no OpenSpec ficarão salvas para a implementação).
- [NEW] `/home/amorim/repos/sprinthub/docs/architecture/` (Decisões de modelagem).

### 2. Aplicações (`apps/`)
- [NEW] `/home/amorim/repos/sprinthub/apps/backend/` (Scaffold vazio gerado pelo `@nestjs/cli`).
- [NEW] `/home/amorim/repos/sprinthub/apps/frontend/` (Scaffold vazio gerado via `create-vue`).

### 3. Pacotes Compartilhados (`packages/`)
- [NEW] `/home/amorim/repos/sprinthub/packages/shared/` 
  - *Será um módulo simples (TypeScript) com entidades e Interfaces para compartilhar contratos entre o NestJS e o Vue, ex: `interface Task { id: string; status: 'todo' | 'doing' | 'done' }`. Assim, se você mudar algo no banco, o Frontend irá quebrar no TypeScript, evitando bugs em produção.*

## User Review Required

> [!IMPORTANT]
> Verifique se a estrutura proposta atende ao que imagina. Quando der o "ok", eu mesmo inicializarei todas as pastas e chamarei as CLIs.

## Open Questions

Para que eu gere tudo de uma vez de forma refinada, por favor, me guie em:
1. **Pacotes**: Prefere usar o `npm` ou o `pnpm` como gerenciador oficial do Monorepo?
2. **Setup do AIOS**: Você quer que eu replique a pasta `.aios-core/` e as regras de agentes (`AGENTS.md`) que você utiliza no outro projeto aqui dentro? Isso manterá nossos atalhos como `@architect`, `@pm`, `@qa` vivos no desenvolvimento do SprintHub!
