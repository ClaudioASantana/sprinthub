# Arquitetura, UX e Resolução de Bugs (19/04/2026)

Este documento registra a evolução e todos os problemas técnicos críticos resolvidos em conjunto durante a etapa de polimento da usabilidade e funcionalidade do Dashboard e Kanban.

## 1. Múltiplos Inquilinos (Multi-Tenancy Dinâmico)
- **Problema:** A barra lateral de navegação (Sidebar Logo) possuía o texto "Empresa" hardcoded local, e os componentes internos (Ex: Projetos, Equipes) estavam enviando constantemente `companyId: '1'` ao criar novos dados. No banco, todas as equipes e projetos estavam indo para um id inexistente.
- **Resolução:** O backend (`auth.controller.ts` no `devLogin`) foi reescrito injetando o `PrismaService` para ir à raiz da tabela de Companies, puxar a primeira empresa ativa (geralmente gerada no Seed, ex: `company-demo-id`) e injetar o nome oficial (`companyName`) e o `companyId` para dentro da criptografia do payload do JWT. 
No Frontend (`utils/jwt.ts` e `.vue` components), a função `getCompanyId()` foi construída para decodificar esse token de forma instantânea sem requisições de rede. Agora toda criação de Projeto e Equipe amarra via UUID dinâmico de onde o usuário pertence.

## 2. API Proxy e o Erro 404
- **Problema:** Ao enviar formulários e testes (`POST /api/teams`), o console do Vue alertava sobre `net::ERR_ABORTED 404 (Not Found)`, pois ele tentava buscar na porta Vite: `5173` em vez da porta NestJS: `3000`.
- **Resolução:** Modificamos a base arquitetural em dois lugares.
  1. Criação do `.env` local no frontend configurando `VITE_API_URL=http://localhost:3000`.
  2. Implementação do `server.proxy` nativo no servidor do `vite.config.ts` (Redirecionamento Invisível / Reverse Proxy). Agora a ponte local simula maravilhosamente a infraestrutura da nuvem do Vercel/Coolify. Embutimos também a variável de baseUrl em **todos** os `fetch` de `.vue`.

## 3. Gestão de Equipes (Tratamento de Relacionamentos N:M e 1:N)
- **Problema:** Tentativa de adicionar membros às "Equipes" no Dashboard gerava 404. Motivo: as rotas não existiam no backend. Também estava utilizando "dados mockados" (`u1`, `u2`) vindos do frontend invés do Postgres. E a checagem no layout gerava falso-negativos por ser array de Strings ao invés de array de Objetos.
- **Resolução:** 
  1. **Backend:** Inseridos `@Post(':id/members')` e `@Delete(':id/members/:userId')` em `TeamsController`.
  2. A nível Prisma Service (`teams.service.ts`), configuramos os Updates conectando o Relacionamento via Foreign Key: `data: { teamId }` no Model relacional de Users. Adicionado `include: { members: true }`.
  3. **Frontend:** Adicionado o fetch `api/users` direto ao banco para popular a aba de inclusão de "Membros", limpando a interface mockada.
  4. Realizado mapeamento (`.map`) ao processar Json para normalizar objetos `{id: 'xxx'}` para string IDs.

## 4. Edição de Projetos 
- **Problema:** A visualização de projetos e o modal de criação funcionavam. Contudo, ao tentar "Editar", o formulário disparava sempre um método `POST` (Criação de novos), gerando duplicações em vez de atualização.
- **Resolução:** Roteamento Inteligente em `DashboardProjects.vue`. Na função `createProject`, se a variável `editingProject` constar no escopo da tela, o método `fetch` fará swap instantâneo e mandatório para `PATCH /api/projects/:id`.

---
*Gerado via Análise e Debugging por pares pelo Agente Uma (UX-Design-Expert) & Usuário via Codex Core.*
