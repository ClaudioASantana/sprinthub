# Visão Geral: Diretório .aios-core no SprintHub

No projeto do SprintHub, o diretório `.aios-core/` atua como o **"cérebro" ou o sistema operacional para Inteligência Artificial (Synkra AIOS / Codex CLI)**. Ele não contém o código do SprintHub em si (como o Vue ou o NestJS), mas sim as regras e engrenagens que as **IAs** utilizam para desenvolver o projeto junto com a equipe de forma padronizada.

Aqui estão as principais funções de como esse diretório é usado na prática:

## 1. Personas e Especialistas (Agentes)
O diretório armazena "personalidades" de IA (`.aios-core/development/agents/`). Isso significa que é possível invocar especialistas diferentes dependendo do objetivo.
*   **Exemplos:** Ao usar atalhos como `@architect`, `@dev`, `@qa`, `@po` (Product Owner) ou `@sm` (Scrum Master), a IA vai ler o perfil configurado lá dentro, mudar o seu comportamento e focar especificamente em arquitetura, programação, testes ou gestão de produto.

## 2. A Constituição (A Lei do Projeto)
Lá existe um arquivo chamado `constitution.md`. Ele é literalmente o conjunto de regras inegociáveis que as IAs devem seguir neste projeto. 
*   *Exemplo prático:* Por causa dessa constituição, a regra de número 3 determina que a IA deve focar em trabalhar usando os arquivos descritos na pasta `docs/stories/` e a proíbe de inventar requisitos além dos artefatos existentes.

## 3. Scripts e Automação (Qualidade)
O diretório gerencia comandos automatizados para garantir a qualidade do código. Com base nas regras do `.aios-core`, a IA sabe que, ao finalizar uma história, precisa passar pelos chamados "Quality Gates", executando validações como linting e typechecking.

## 4. Templates, Checklists e Workflows
Dentro de `.aios-core/development/` existem padrões e diretrizes operacionais, como templates para gerar novas *stories*, fluxos de trabalho e checklists de revisão. Isso garante que a criação de novos recursos, como "Crie uma nova story para um fluxo de aprovação", não seja feita de forma aleatória, mas sim seguindo a estrutura exata definida pelo projeto.

## Resumo Simples
O `.aios-core` é a pasta que contém o **manual de instruções para as IAs**. É nele que fica definido *como* os agentes de IA devem interagir, analisar o projeto e organizar as tarefas do SprintHub sem desorganizar a estrutura e arquitetura do repositório.
