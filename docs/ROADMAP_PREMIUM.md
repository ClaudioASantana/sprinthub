# Roadmap Premium — avaliação, posicionamento e sequência

> Documento vivo. Primeira versão: 01/09/2026.
> Registra o **porquê** das decisões — o que fazer está nas stories em `docs/stories/`.

## 1. Diagnóstico

O SprintHub tem produto de verdade: 7 entidades bem modeladas, 52 rotas, 17 páginas, sync com GitHub Projects v2 e um MCP Server funcional. Isso é bem mais que um MVP.

E está publicamente aberto.

### 1.1 O bloqueador

Levantado contra o backend local em 01/09/2026:

| Verificação | Resultado |
| --- | --- |
| `GET /api/tasks` sem token | 200 — 153 tarefas de todos os tenants |
| `GET /api/sprints` sem token | 200 |
| `GET /api/teams` sem token | 200 — vaza `companyId` |
| `GET /api/users?companyId=<vazado>` | 200 — e-mail, nome e role dos usuários |
| `POST /api/auth/dev-login` com `role: super_admin` | 200 — JWT válido, **sem senha** |
| Esse token em `/companies`, `/projects`, `/stats` | 200 em todos |

6 das 10 controllers não têm guard. E os guards que existem não protegem nada, porque qualquer pessoa emite um token de `super_admin` pelo `dev-login`.

Multi-tenancy sem isolamento é o pior lugar para se estar: os dados de vários clientes no mesmo banco, e nenhuma parede entre eles. **Nenhuma discussão de posicionamento premium importa antes disso ser resolvido** → Stories [030](stories/030-guard-global-autenticacao.md), [031](stories/031-isolamento-tenant-jwt.md), [032](stories/032-autenticacao-real-dev-login.md).

### 1.2 O risco de médio prazo

Mais preocupante que a segurança — que tem solução conhecida e prazo curto — é o descompasso entre superfície e fundação:

- **0 testes** no frontend e no admin; nenhum runner configurado
- **0 CI** — não existe `.github/workflows/`
- `AppBoard.vue` com **1.179 linhas**, ~1/5 de todo o código de páginas
- Apenas **2 componentes compartilhados** — a lógica mora dentro das páginas
- **3 definições divergentes** dos enums de Task (schema, DTO, MCP) — uma tarefa criada por REST com `status: 'review'` é aceita e some do Kanban

É o padrão clássico de produto solo que trava por volta do mês 6: cada feature nova custa mais que a anterior, aí ninguém mais encosta no código antigo e o produto congela.

Nascer há pouco é vantagem aqui. Consertar agora, com dados de teste, custa dias. Consertar com 10 clientes pagantes custa um incidente.

### 1.3 O que não existe e todo SaaS pago tem

Nenhum modelo de assinatura, plano ou limite ([Story 042](stories/042-planos-e-cobranca.md)) · nenhum log de auditoria ([033](stories/033-log-auditoria.md)) · nenhum realtime ([041](stories/041-realtime-board.md)).

---

## 2. Leitura de mercado (01/09/2026)

### 2.1 Competir de frente é perder

O Linear cresceu ~67% ano a ano em novas empresas enquanto o Jira caiu ~32%, chegando a ~US$ 100M de ARR. Venceu por **velocidade e opinião forte**, não por ter mais funcionalidade. O Jira tem 300 mil organizações e 3 mil apps de marketplace.

Não há espaço para um terceiro "Scrum genérico, só que melhor".

### 2.2 2026 é o ano dos agentes

Jira Rovo Agents (beta aberto, fev/2026) · Notion Custom Agents, **rodando sobre MCP** (GA fev/2026) · ClickUp Brain · Asana Sprint Accelerator.

O SprintHub já tem MCP funcionando e testado. Isso o coloca à frente da maioria — não da ideia, mas da execução: falta a camada de confiança (autenticação, tenant, auditoria, aprovação).

### 2.3 O Brasil é outro mercado

Panorama de gestão de projetos, n=1.253:

- **36,93%** das empresas usam software de gestão de projetos
- **29,98%** ainda usam **Excel**
- **16,47%** de adoção de IA na gestão
- **24,77%** apontam alinhamento e adoção do time como principal dificuldade

**O concorrente real não é o Jira. É a planilha.**

E a dor nº 1 de agências e consultorias não é desorganização: é **invisibilidade da rentabilidade** — o projeto entrega no prazo, queima 20% mais horas do que foi vendido, e ninguém vê até fechar o trimestre.

Concorrentes locais: PangoScrum, Artia, Duesoft, Taskrush. Lacunas abertas: NFS-e e retenção de ISS, residência de dados e LGPD.

---

## 3. Posicionamento

Duas cunhas defensáveis, que se somam:

### A — "O backlog que o agente de código dirige"

O dev fala com o Claude Code ou o Cursor; o agente cria a story, estima, move para a sprint e fecha o card. O GitHub é fonte da verdade do código, o SprintHub é fonte da verdade do planejamento — exatamente o que `ai-integration-architecture.md` já defende.

Para virar produto: [Story 038](stories/038-mcp-remoto-autenticado.md) (MCP remoto autenticado) + [039](stories/039-propor-e-aprovar-acoes-agente.md) (propor-e-aprovar).

### B — "Sprint com preço"

Apontamento de horas → custo por pessoa → **rentabilidade por sprint e por projeto**. Ataca a dor nº 1 do segmento e é o que transforma o SprintHub em sistema que o dono da agência não consegue desligar.

[Story 040](stories/040-timesheet-rentabilidade-sprint.md).

### A frase

> O agente planeja e executa, e o dono vê quanto cada sprint deu de lucro.

Nem Linear nem Jira vão fazer NFS-e. Nem Artia nem PangoScrum vão ser AI-native. A interseção está vazia.

---

## 4. O que "premium" significa aqui

Premium não é ter mais telas. É **confiança**.

| Camada | O que é | Estado em 01/09/2026 |
| --- | --- | --- |
| **0 — Licença para existir** | Auth, isolamento de tenant, auditoria, LGPD | ausente |
| **1 — A cunha** | MCP remoto autenticado + rentabilidade | MCP existe, local e sem auth |
| **2 — Acabamento** | Realtime, performance, onboarding | não iniciado |

Não dá para pular a camada 0. Um vazamento entre tenants não é bug — é o fim da conversa comercial.

---

## 5. Sequência recomendada

**Duas semanas sem nenhuma feature nova.** Não é glamouroso; é o que compra os próximos seis meses.

| Ordem | Story | Por quê |
| --- | --- | --- |
| 1 | [034 — CI](stories/034-pipeline-ci.md) | Meia hora, e protege tudo que vem depois |
| 2 | [030 — Guard global](stories/030-guard-global-autenticacao.md) | Fecha 6 controllers de uma vez |
| 3 | [031 — Isolamento de tenant](stories/031-isolamento-tenant-jwt.md) | Mata a enumeração entre empresas |
| 4 | [032 — Autenticação real](stories/032-autenticacao-real-dev-login.md) | Sem isso, 030 e 031 são inúteis |
| 5 | [037 — Vocabulário](stories/037-unificar-vocabulario-dominio.md) | Barato, e destrava enum no banco |
| 6 | [043 — Sync silencioso](stories/043-corrigir-erros-silenciosos-sync-github.md) | Bug conhecido, correção pequena |
| 7 | [033 — Auditoria](stories/033-log-auditoria.md) | Pré-requisito de 038, 039 e 042 |
| 8 | [035 — Testes de front](stories/035-testes-frontend.md) | Rede antes de refatorar |
| 9 | [036 — AppBoard](stories/036-refatorar-appboard.md) | Destrava realtime e ações de agente |
| 10 | **Escolher a cunha** | 038+039, ou 040 |
| 11 | [041](stories/041-realtime-board.md), [042](stories/042-planos-e-cobranca.md) | Acabamento e monetização |

O CI vem antes da segurança de propósito: sem ele, a correção de segurança pode ser desfeita sem ninguém notar.

**Sobre o passo 10:** a recomendação é **B (rentabilidade) primeiro**. Monetiza mais rápido, e IA sem faturamento não paga conta. Mas A é o que ninguém no Brasil tem — se aparecer um cliente âncora interessado em agentes, inverter é defensável.

---

## 6. Decisões em aberto

1. **Cunha primária: A ou B?** — seção 3
2. **Conjunto oficial de status e prioridade** — [Story 037](stories/037-unificar-vocabulario-dominio.md)
3. **Isolamento de tenant: join via Project ou desnormalizar `companyId`?** — [Story 031](stories/031-isolamento-tenant-jwt.md)
4. **Escrita de agente: livre, sob aprovação, ou configurável?** — [Story 039](stories/039-propor-e-aprovar-acoes-agente.md)

Registrar a decisão **aqui** quando for tomada. Decisão que só existe no chat não sobrevive à próxima sessão.

---

## 7. Pendências operacionais

- Antes do primeiro deploy: conferir se o banco de produção já tem tabelas criadas por `db push`. Se tiver, rodar `prisma migrate resolve --applied 0_init` lá, senão o deploy falha com **P3005**.
- Registrar `http://localhost:3005/api/auth/callback` nas redirect URIs permitidas do client no provedor Go Auth — **fora deste repo**.
- Validar no browser a criação de tarefa com Assignees + Sprints.

---

## Fontes

- [Linear vs Jira 2026](https://tech-insider.org/linear-vs-jira-2026/)
- [Linear vs Jira — times de desenvolvimento](https://www.buildmvpfast.com/blog/linear-vs-jira-project-management-developer-team-2026)
- [AI Project Management Tool Rankings 2026](https://www.agilegenesis.com/post/ai-project-management-tool-rankings-2026)
- [Agentic Project Management](https://www.sprintrr.ai/blog/what-is-agentic-project-management)
- [IA para sprint planning 2026](https://www.buildmvpfast.com/blog/ai-project-management-automation-sprint-planning-2026)
- [Panorama de gestão de projetos no Brasil](https://artia.com/blog/panorama-de-gestao-de-projetos/)
- [Melhores softwares de gestão de projetos](https://blog.taskrush.com.br/melhores-softwares-de-gestao-de-projetos-guia-completo-para-empresas/)
- [LGPD para SaaS](https://www.iugu.com/blog/lgpd-para-saas)

> Ressalva: boa parte das comparações Linear vs. Jira vem de blogs com viés de afiliado e foi tratada com desconto. Os dados brasileiros (n=1.253) são mais sólidos.
