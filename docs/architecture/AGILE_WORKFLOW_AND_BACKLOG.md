# Gestão Ágil e Backlog no SprintHub

Este documento detalha o fluxo de gestão de produtos, focado em metodologias ágeis (Scrum/Kanban) e como a interface do SprintHub se conecta com a modelagem real de dados no banco (Prisma).

## 1. Visão de Produto e Escopo da Empresa
Quando uma **Empresa** (`model Company`) começa a usar o SprintHub, ela deve estabelecer pelo menos um **Projeto** (`model Project`). Tudo no sistema gira em torno desse projeto base. Um projeto atua como o grande contêiner que guarda tanto o planejamento futuro (*Backlog*) quanto a execução atual (*Sprints*).

## 2. A Anatomia do Backlog e Tarefas
A espinha dorsal do repositório de trabalho é o **`model Task`**. Ao contrário de ferramentas que dividem Epics, Stories e Tasks em tabelas separadas no banco de dados, o SprintHub adota uma abordagem arrojada e simplificada de centralização.

### 2.1. O Model de Tarefa Unificada
No nosso banco de dados, tudo é tecnicamente uma "Tarefa", diferenciada apenas pela sua taxonomia:
- O campo `type` define o escopo do registro:
  - `epic`: Grandes entregas que abrangem diversas funcionalidades.
  - `story`: Uma história de usuário tangível (uma funcionalidade com valor de negócio).
  - `task`: Sub-divisões técnicas necessárias para executar uma história.
  - `bug`: Anomalias a serem corrigidas.
- O campo `priority` classifica a aderência temporal da demanda (`low`, `medium`, `high`).
- O campo `storyPoints` unifica a métrica de esforço ágil (tamanho).

### 2.2. A Definição Lógica do Product Backlog
O "Backlog" não existe como uma entidade/tabela própria no banco. Ele é uma **visão**.
> **Regra de Negócio Técnica:** O Backlog de um Projeto é conceptualmente o somatório de todos os registros da tabela `Task` que pertencem a um determinado `projectId` cuja associação ao `sprintId` seja NULA (`null`).

Dessa forma, a tela de Backlog na Plataforma funcionará emitindo uma query parecida com:
```typescript
prisma.task.findMany({
  where: {
    projectId: currentProjectId,
    sprintId: null // Fundamental para determinar que não está em planejamento/execução
  }
})
```

## 3. O Fluxo de Execução (O Ciclo de Vida)

Como uma empresa processa a entrega no nosso sistema?

1. **Descoberta:** O Product Owner (PO) cria Ideais, Bugs e Épicos. Eles preenchem a tabela de `Task` com `sprintId = null`. O status inerente é `"todo"`.
2. **Planejamento do Sprint (Planning):** 
   - A gestão cria um novo registro em `model Sprint` com datas e objetivos (`goal`).
   - Na tela do Backlog, ocorre uma interface Drag & Drop (arrastar e soltar), na qual Histórias são movidas do Backlog para o Bloco do Sprint recém-criado.
   - **Banco de Dados:** Neste momento, o sistema faz um `PATCH /tasks/:id` e atualiza o `sprintId` com o ID da nova Sprint.
3. **Execução:**
   - Este é o "Dashboard Kanban". Esta visão ignora todo o peso do Backlog. 
   - Sua query é restritiva: filtra apenas as tarefas onde `sprintId == sprintAtivo.id`.
   - As colunas ("A Fazer", "Em Progresso", "Feito") alteram unicamente o campo `status` da tabela (`todo`, `in_progress`, `done`).

## 4. Evoluções Futuras (Roadmap Técnico)

### Parentesco Hierárquico (Pai-e-Filho)
No momento, o `model Task` é "flat" (linear). Todos os tickets competem no mesmo nível.
Se uma empresa desejar quebrar um `epic` em várias `stories`, e cada story em micro-tarefas de programação, precisaremos de vinculação hierárquica na engine do banco.

**Sugestão de Alteração Direta (Prisma Schema):**
```prisma
model Task {
  // ... campos existentes
  parentId    String?
  parent      Task?   @relation("TaskHierarchy", fields: [parentId], references: [id])
  children    Task[]  @relation("TaskHierarchy")
}
```
Isso permitirá montar árvores complexas (ex: listar uma feature e clicar em expansão para exibir todas as sub-tasks), essencial para ferramentas ágeis maduras como o Jira ou Azure DevOps. 

## 5. Diretrizes para a Tela de Backlog (Interface)
1. Deve ser predominantemente focada em **listagem massiva (Table Mode)** em vez de Cartões, com prioridade visual à linha horizontal.
2. Deve disponibilizar um cabeçalho fixo para criação extremamente rápida (`inline create` input).
3. Deve ter filtros granulares por `type` (Esconder bugs? Esconder epics?).
4. O painel lateral direito possivelmente ativará o painel de propriedades completas sem sair da tela.
