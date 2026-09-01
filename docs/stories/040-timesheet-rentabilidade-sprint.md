---
title: "Story 040 — Timesheet e rentabilidade por sprint"
type: "epic"
status: "todo"
priority: "high"
storyPoints: 13
projectId: "project-sprinthub-core"
---
# Story 040 — Timesheet e rentabilidade por sprint

## Objetivo

Responder a pergunta que nenhuma ferramenta de Scrum responde: **este sprint deu lucro?**

## Contexto

Pesquisa de mercado de 01/09/2026. No Brasil, apenas 36,93% das empresas usam software de gestão de projetos e 29,98% ainda usam Excel — o concorrente real do SprintHub não é o Jira, é a planilha. E a dor mais citada por agências e consultorias não é desorganização: é **invisibilidade da rentabilidade**. O projeto entrega no prazo, queima 20% mais horas do que foi vendido, e ninguém percebe até fechar o trimestre.

Story points medem esforço relativo. Não medem dinheiro. O dono da agência não decide nada com velocity — decide com margem.

Esta é a funcionalidade que transforma o SprintHub de "mais um Kanban" em sistema que o dono não consegue desligar. Nem Linear nem Jira vão nessa direção: o público deles é o time de produto, não quem paga a folha.

## Escopo (quebrar em stories menores na implementação)

1. **Apontamento de horas** — timer e lançamento manual na tarefa
2. **Custo** — custo/hora por usuário (dado sensível: visível só para `admin`)
3. **Contrato do projeto** — valor fechado ou horas vendidas × taxa
4. **Cálculo** — custo realizado vs. valor contratado, por sprint e por projeto
5. **Visualização** — margem por sprint, tendência, alerta de estouro previsto
6. **Exportação** — CSV e relatório do período

## Critérios de aceite (do épico)

- [ ] Usuário aponta horas numa tarefa em menos de 3 cliques
- [ ] `admin` define custo/hora por membro; membro **não** vê o custo dos colegas
- [ ] Projeto tem valor contratado e/ou horas vendidas
- [ ] Sprint fechada mostra horas gastas, custo, receita proporcional e margem
- [ ] Alerta quando o ritmo projeta estouro do orçamento antes do fim do projeto
- [ ] Relatório de rentabilidade por projeto e por período, exportável
- [ ] Todos os números respeitam o isolamento de tenant ([Story 031](031-isolamento-tenant-jwt.md))

## File list

- `apps/backend/prisma/schema.prisma` (`TimeEntry`, `UserRate`, `ProjectContract`)
- `apps/backend/src/time-entries/`
- `apps/backend/src/reports/`
- `apps/frontend/src/pages/AppProjectOverview.vue`
- `apps/frontend/src/pages/AppReports.vue`

## Notas

- **Custo/hora é dado sensível.** Controle de acesso por papel desde a primeira linha, não depois.
- Apontamento de horas é a parte que os times odeiam. A fricção do lançamento decide se a funcionalidade vive ou morre — aqui o MCP ajuda de verdade: o agente aponta a hora a partir do commit, e o dev só confirma.
- NFS-e e retenção de ISS são a evolução natural, e nenhuma ferramenta estrangeira faz. Não entra neste épico — vira story própria quando houver cliente pagante pedindo.
- Ver [ROADMAP_PREMIUM.md](../ROADMAP_PREMIUM.md) para o racional de posicionamento.
