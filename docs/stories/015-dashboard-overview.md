# Story 015 - Dashboard Home (Métricas e Relatórios)

## Descrição
Como Administrador ou Gerente,
Quero poder visualizar na tela inicial o volume de projetos, tarefas, sprints e empresas ativas,
Para ter controle e insights sobre o volume de produtividade sem precisar clicar em cada módulo separadamente.

## Critérios de Aceite
- [ ] O backend precisa possuir um EndPoint `GET /api/stats` que consolide e traga as contagens exatas do Banco de Dados via Prisma.
- [ ] O `DashboardOverview.vue` não deve possuir nenhum dado Chumbado/Hardcoded. 
- [ ] A tela de Overview deve apresentar tratamento de carregamento (Loading) caso as queries SQL estejam pesadas.
- [ ] Os dados devem respeitar os relacionamentos dos bancos de dados, trazendo os volumétricos em nuvem de forma responsiva.

## Technical Notes
- Rotas Backend: `app.controller.ts` ou Módulo Específico.
- Querys de Performance Prisma: `.count()`.
