# Story 013 - Frontend Kanban Premium (Pintura da Casa)

## Descrição
Como Usuário,
Quero ter um Kanban visual com suporte completo a arrastar e soltar (Drag and Drop),
Para organizar minhas Sprints e Tarefas de forma prática, ágil, e com um design premium que pareça fluido.

## Critérios de Aceite
- [x] O usuário consegue visualizar 3 blocos bem definidos: "A Fazer", "Em Progresso" e "Concluído".
- [x] O usuário consegue arrastar os cartões de qualquer coluna para qualquer coluna. O visual muda em tempo real.
- [x] Após o usuário arrastar um cartão, fazer o mapeamento via API `PATCH /tasks/:id` e garantir que o status foi atualizado.
- [x] Detalhamento da tarefa através de um Side-Panel (painel lateral) elegante substituindo o modal genérico.
- [x] Estilizar completamente os ícones e rótulos para Português (Bug -> Erro, Story -> História, etc.).
- [x] Botão para rapidamente abrir o painel lateral pra adicionar Nova Tarefa em uma coluna específica.

## Technical Notes
- Biblioteca para Drag/Drop: `vuedraggable` no modo de compatibilidade para Vue 3.
- Utilizar Flexbox e recursos de UI modernos como bordas redondas avançadas, sombras sutis, indicadores de estado visual.
- Nomes das requisições para a API de Sprints e Tasks precisarão capturar atualizações.
