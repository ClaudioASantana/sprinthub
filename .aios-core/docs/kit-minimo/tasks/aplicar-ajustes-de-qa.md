# Task · Aplicar ajustes de QA

## Quando usar
Quando uma story recebeu feedback de QA, revisão técnica ou gate de qualidade e você precisa transformar isso em correções objetivas.

## Objetivo
Resolver issues apontadas por QA de forma sistemática, sem corrigir só sintomas e sem piorar o resto do código.

## Passos
1. Reúna o feedback recebido.
2. Classifique os pontos em:
   - **Bloqueantes**: precisam ser resolvidos antes de seguir
   - **Importantes**: devem ser corrigidos nesta rodada
   - **Melhorias**: podem virar follow-up
3. Para cada item bloqueante/importante:
   - identifique arquivos afetados;
   - encontre a causa raiz;
   - planeje a correção;
   - atualize testes se necessário.
4. Aplique as mudanças por grupos lógicos.
5. Revalide:
   - lint;
   - testes;
   - typecheck/build, se aplicável;
   - comportamento principal da feature.
6. Atualize a story com:
   - notas do que foi ajustado;
   - arquivos alterados;
   - follow-ups ou dívida remanescente.

## Saída esperada
Uma rodada de correções concluída, verificável e pronta para reavaliação.

## Armadilhas comuns
- corrigir efeito e não causa
- esquecer regressão
- não registrar o que mudou
- misturar refactor amplo com fix pontual sem necessidade

## Regra prática
QA bom não é atrito; é filtro. Trate os achados como insumo de qualidade, não como burocracia.
