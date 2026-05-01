# Story 015 - Dashboard Home (Métricas e Relatórios)

## Descrição
Como Administrador ou Gerente,
Quero poder visualizar na tela inicial o volume de projetos, tarefas, sprints e empresas ativas,
Para ter controle e insights sobre o volume de produtividade sem precisar clicar em cada módulo separadamente.

## Critérios de Aceite
- [x] O backend precisa possuir um EndPoint `GET /api/stats` que consolide e traga as contagens exatas do Banco de Dados via Prisma.
- [x] O `DashboardOverview.vue` não deve possuir nenhum dado Chumbado/Hardcoded. 
- [x] A tela de Overview deve apresentar tratamento de carregamento (Loading) caso as queries SQL estejam pesadas.
- [x] Os dados devem respeitar os relacionamentos dos bancos de dados, trazendo os volumétricos em nuvem de forma responsiva.

## Technical Notes
- Rotas Backend: `AppController` + `AppService.getStats(companyId?)`.
- Querys de Performance Prisma: `.count()` com `Promise.all()`.
- Stats escopadas por `companyId` (do JWT) para tenant; globais para super_admin.
- Admin `DashboardOverview.vue` também atualizado com dados reais.

