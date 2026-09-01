---
title: "Story 042 — Planos e cobrança"
type: "epic"
status: "todo"
priority: "medium"
storyPoints: 8
projectId: "project-sprinthub-core"
---
# Story 042 — Planos e cobrança

## Objetivo

Poder cobrar. Hoje não existe nenhum modelo de assinatura, plano ou limite no schema — o SprintHub é multi-tenant, mas não tem como monetizar um tenant.

## Contexto

`Company` tem apenas `cnpj` e `active`. Não há plano, ciclo, limite de uso nem histórico de pagamento. Enquanto isso não existir, todo cliente é gratuito por construção.

Não é urgente antes de existir cliente pagante — mas é bloqueador absoluto no dia em que existir, e o modelo de dados influencia decisões que estão sendo tomadas agora (o que limitar, o que medir).

## Escopo

1. **Planos** — definição, limites e preço
2. **Assinatura** — vínculo empresa ↔ plano, ciclo, status
3. **Aplicação de limites** — bloqueio ou aviso ao exceder
4. **Gateway** — integração de pagamento
5. **Autoatendimento** — contratar, mudar de plano, cancelar sem falar com ninguém

## Critérios de aceite (do épico)

- [ ] Models `Plan`, `Subscription`, `Invoice` no Prisma
- [ ] Limites por plano: usuários, projetos, chamadas de MCP, retenção de auditoria
- [ ] Guard de limite aplicado no backend, não só escondido na UI
- [ ] Período de teste com expiração automática
- [ ] Gateway integrado, com webhook de confirmação idempotente
- [ ] Emissão de nota fiscal ou caminho documentado para isso
- [ ] Painel super-admin mostra plano, uso e situação de cobrança por empresa
- [ ] Empresa inadimplente cai para leitura, sem perder dado

## File list

- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/billing/`
- `apps/sprinthub-admin/src/pages/`

## Notas

- Gateway com PIX e boleto pesa mais que cartão no Brasil para B2B. Avaliar quando chegar a hora.
- Limite de chamadas de MCP é a métrica que casa com a cunha de IA ([Story 038](038-mcp-remoto-autenticado.md)): quem usa agente consome mais, e é justo que pague mais. Vale já **medir** isso antes de cobrar.
- Requer o [log de auditoria](033-log-auditoria.md) e o [isolamento de tenant](031-isolamento-tenant-jwt.md) prontos. Cobrar por uso que não é medido com confiança gera disputa com cliente.
