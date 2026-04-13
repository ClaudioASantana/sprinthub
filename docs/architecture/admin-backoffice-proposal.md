# Proposta de Arquitetura: Painel Administrativo (Backoffice) do SprintHub

## 1. Visão Geral
A arquitetura proposta para o gerenciamento do ecossistema do SprintHub (SaaS) envolve a criação de um módulo ou sistema separado, frequentemente chamado de **Backoffice**, **Admin Panel** ou **Super Admin**.

Esta abordagem é a melhor prática recomendada na arquitetura de sistemas SaaS modernos.

## 2. Por que adotar um sistema/módulo separado?

### 2.1 Separação de Preocupações (Separation of Concerns)
A interface do cliente final tem necessidades de UX/UI muito diferentes da interface do proprietário do SaaS. Manter aplicações separadas mantém o código do sistema voltado para os clientes mais limpo, evitando a poluição estrutural com checagens constantes de permissão (ex: iterar verificações de `isSuperAdmin` por toda a interface).

### 2.2 Segurança e Isolamento
A separação isola funcionalidades destrutivas ou de alto privilégio. Caso uma vulnerabilidade seja explorada no painel do usuário comum, o atacante não terá sequer o ambiente administrativo (onde se encontram controles de faturamento e exclusão de *Tenants*) à disposição, pois os códigos de front-end rodam em contextos separados.

### 2.3 Performance e Evolução Independente
Tarefas de backoffice, como gerar relatórios globais de acessos, faturamento, ou listar massivamente os usuários, exigem consultas pesadas no servidor. Com aplicações separadas, o deploy e a modernização do painel administrativo não impactam a usabilidade ou o tráfego do cliente final.

---

## 3. Sugestão de Implementação no Contexto do Monorepo

Dado que o SprintHub está adotando a estrutura de **Monorepo** (ex: pastas `apps/` e `packages/`), a arquitetura sugerida adequa-se perfeitamente da seguinte maneira:

### 3.1 A Divisão dos Frontends (`apps/`)
Criaremos duas aplicações de interface primárias, ambas aproveitando bibliotecas comuns compartilhadas (`packages/`):

*   **`apps/sprinthub-web` (Customer-Facing):** 
    O SaaS original. É o portal onde os clientes entram, gerenciam suas *sprints*, tarefas e fluxos. Administradores neste ambiente possuem privilégios unicamente **restringidos à própria empresa (Tenant)**.
    
*   **`apps/sprinthub-admin` (Backoffice/SaaS Management):** 
    O painel interno exclusivo para a equipe do SprintHub. Nele ocorrem:
    * Criação e onboarding guiado/manual de novas contas.
    * Gerenciamento de planos de assinatura.
    * Funcionalidade de "Impersonate" (logar como o cliente para dar auxílio técnico e suporte).
    * Dashboards gerenciais e BI global do SaaS.

### 3.2 Estratégia de Acesso e Papéis (Roles)
O módulo de Gestão de Acesso (já em desenvolvimento) precisará controlar, a princípio, três macro níveis de hierarquia no payload do JWT:

1.  **`SUPER_ADMIN`**: Administradores globais (Equipe SprintHub). Possuem acesso autorizado para ingressar no `sprinthub-admin`.
2.  **`TENANT_ADMIN` (Workspace Admin)**: O responsável ("dono") por uma empresa/instância cadastrada no SprintHub. Possui restrições de Tenant no `sprinthub-web`.
3.  **`USER` (Membro Normal)**: Funcionário atrelado à empresa; executa as operações cotidianas dentro do `sprinthub-web`.

### 3.3 A Arquitetura do Backend
Para otimizar os recursos iniciais de infraestrutura, **não é obrigatório** ter repositórios de backend diferentes no início. Pode-se utilizar o mesmo serviço backend (ex: NestJS ou Go), contanto que existam rotas rigorosamente separadas por restrição de acesso e middlewares:

*   `/api/admin/...` -> Rotas de backoffice. O middleware verifica a presença obrigatória da Role **SUPER_ADMIN**.
*   `/api/tenant/...` -> Rotas do sistema SaaS. O middleware processa as requisições atrelando-as ao **TenantID** para o isolamento dos dados.

---
*Este documento reflete a estratégia decidida e orientada às melhores diretrizes de produto discutidas em 08/Abr/2026. Para referências de execução, utilize as stories que derivam desta especificação.*
