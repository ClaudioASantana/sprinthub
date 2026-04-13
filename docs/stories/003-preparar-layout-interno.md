# Story 003 - Preparação do Layout Interno (Dashboard Shell)

O objetivo desta etapa é transformar o `DashboardLayout.vue` atual (que possui conteúdo embutido de demonstração) em um verdadeiro **Layout Container/Shell**. Isso permitirá que tenhamos rotas filhas na URL (`/dashboard`, `/dashboard/tenants`, etc.) e cada respectiva tela será renderizada no espaço central de conteúdo sem forçar recarregamentos na página.

## Proposta de Implementação

### Frontend Vue (SprintHub Admin)

#### Modificar `src/pages/DashboardLayout.vue`
- Substituir os links manuais do menu lateral (`<a href="#">`) por `<router-link>` utilizando a classe `active-class` do Vue Router para o estilo destacado.
- Extrair conteúdo estático da tag `<main>` (Onde diz "Bem-vindo ao Backoffice" e cards stat) e substituí-lo pela tag `<router-view />`.
- Ler rapidamente os dados do usuário do JWT (utilizando nosso utilitário `parseJwt` de `api.ts`) no escopo do `setup` no Vue, para que o `<header>` possa exibir a inicial e o nome do Administrador reais logados, em vez de dados falsificados ("dummy data").

#### Criar `src/pages/DashboardOverview.vue`
- Aqui colocaremos o HTML e CSS extraídos (Welcome, Stats-Grid).
- Funcionará como a visualização mestre a ser renderizada quando a rota for exata: `/dashboard`.

#### Modificar `src/router/index.ts`
- Alterar registro das rotas para embutir o recurso `children` de sub-rotas.
- `/dashboard` continuará renderizando o `DashboardLayout`, contudo seu `children: [{ path: '', name: 'Overview', component: DashboardOverview }]` injetará também o sumário na vista padrão.

## Critérios de Aceite
- [ ] O `/dashboard` funciona como App Shell, tendo um `<router-view>` interno.
- [ ] O acesso direto a `/dashboard` renderiza o componente `DashboardOverview.vue`.
- [ ] O menu de navegação lateral utiliza `<router-link>` e indica a tela ativa corretamente.
- [ ] O cabeçalho exibe as informações dinâmicas do usuário lidas do JWT logado.
