# Conceitos de Engenharia de IA (AI Engineering)

Este documento foi criado para registrar e servir como guia de estudos sobre como o SprintHub utiliza a Inteligência Artificial, classificando as abordagens para facilitar o aprendizado em **Engenharia de IA**.

---

## 1. O Mapa do Mundo da IA

Hoje, podemos dividir o trabalho com Inteligência Artificial em três grandes camadas:

1. **Machine Learning Clássico (ML):** É a estatística pura. Envolve treinar algoritmos em bases de dados para prever coisas (ex: prever churn de clientes, reconhecimento de imagem). O profissional lida intensamente com matemática, pesos, redes neurais e limpeza/validação de dados.
2. **Desenvolvimento de LLMs (Model Builders):** São os pesquisadores (como os da OpenAI, Google ou Anthropic) criando os "cérebros" gigantes (GPT-4, Claude). Eles treinam esses modelos com trilhões de palavras usando imenso poder computacional e GPUs.
3. **AI Engineering / AI Harnessing (Onde estamos):** O Engenheiro de IA moderno raramente cria um "cérebro" do zero. O trabalho nesta camada é pegar um LLM que já está pronto e **construir o corpo ao redor dele (o Harness)** para que ele possa interagir de forma segura e útil com sistemas reais de software.

## 2. Como classificamos o que foi feito no SprintHub?

O que construímos no SprintHub **não foi** Machine Learning Clássico (não treinamos nenhuma rede neural) e nem a criação de um LLM. 

Nós focamos em **AI Harnessing** (Construção de "Arreios" ou "Infraestrutura" para IA) e **Agentic Engineering** (Engenharia para Agentes Autônomos).

Um LLM nativo é como um gênio hiperinteligente trancado num quarto sem internet e sem mãos: ele só sabe conversar. O nosso trabalho como Engenheiros de IA neste projeto foi dar **Olhos** e **Mãos** para os LLMs poderem operar o produto.

---

## 3. As Técnicas de Engenharia de IA Utilizadas

### A. Dar "Olhos" para a IA (O Padrão Docs-as-Code)
Na arquitetura do SprintHub, padronizamos as histórias (features) usando *YAML Frontmatter* dentro de arquivos Markdown (`docs/stories/`). 

- **Por que isso é AI Engineering?** 
  LLMs são máquinas baseadas nativamente em texto. Se guardarmos as tarefas apenas em um banco de dados relacional (SQL) fechado, a IA precisaria fazer chamadas complexas só para saber o que precisa ser feito. Ao estruturar os dados em Markdown (Docs-as-Code), permitimos que o LLM "leia" todo o contexto do software imediatamente. O sistema passa a se adaptar ao "idioma" da IA (context window otimizada), e não o contrário.

### B. Dar "Mãos" para a IA (Ferramentas / Tooling / MCP)
Nós construímos o Servidor MCP (Model Context Protocol) nativo para o SprintHub, rodando via comunicação de terminal (Stdio). 

- **Por que isso é AI Engineering?** 
  O LLM não consegue executar nativamente um comando `UPDATE task SET status = 'done'` no banco PostgreSQL. No entanto, os LLMs modernos possuem uma habilidade chamada **Function Calling** (Chamada de Função). 
  
  Ao criar o servidor MCP, nós dissemos para a IA: *"Você tem uma ferramenta chamada `update_task_status`. Se você decidir que uma tarefa acabou, me mande um JSON com o ID dela e o novo status, e o meu código (Harness) vai até o banco de dados e executa isso para você."*
  
  Isso é construir um **AI Harness**: A infraestrutura de software que envelopa o LLM e permite que ele haja (Agentic Workflow) de forma segura.

---

## Resumo Executivo (Como apresentar este projeto)

Se precisar explicar tecnicamente a sua atuação neste repositório:

> *"Estou atuando como **AI Engineer**. Não estou treinando modelos fundacionais, mas sim construindo um **AI Harness**. Transformei a arquitetura do produto para ser **AI-Native**, utilizando o padrão **Docs-as-Code** para otimizar o contexto (context window) dos LLMs. Além disso, implementei um servidor **MCP (Model Context Protocol)** para expor funções de backend nativas (Function Calling), permitindo que **Agentes Autônomos** manipulem o backlog e operem as regras de negócio do meu SaaS com total integração."*
