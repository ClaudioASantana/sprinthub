# Task · Criticar especificação

## Quando usar
Quando a story, PRD ou proposta técnica parece boa à primeira vista, mas você quer testar sua solidez antes de implementar.

## Objetivo
Encontrar lacunas, ambiguidades, inconsistências, inviabilidades e desalinhamentos antes que elas virem retrabalho.

## Dimensões de crítica
### 1. Clareza
- O que deve ser construído está inequívoco?
- O resultado esperado está mensurável?

### 2. Completude
- Há contexto suficiente para implementar?
- Dependências e restrições foram explicitadas?

### 3. Consistência
- A especificação se contradiz em algum ponto?
- Os critérios de aceite combinam com o escopo?

### 4. Viabilidade
- A proposta é tecnicamente executável?
- Cabe no tamanho esperado da entrega?

### 5. Alinhamento
- Respeita stack, padrões e arquitetura do projeto?
- Nome, organização e abordagem combinam com o código existente?

## Passos
1. Leia o artefato do começo ao fim.
2. Avalie cada dimensão acima.
3. Liste problemas por gravidade:
   - **Alta**: bloqueia ou torna a implementação insegura
   - **Média**: cria risco relevante de retrabalho
   - **Baixa**: melhoria recomendável
4. Para cada problema, proponha correção objetiva.
5. Dê um veredito final:
   - **APPROVED**
   - **NEEDS REVISION**
   - **BLOCKED**

## Saída esperada
Uma revisão curta e acionável, com problemas concretos e sugestões diretas de melhoria.

## Regra prática
Não critique por estilo; critique pelo risco real que a especificação cria.
