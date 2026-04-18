# Boas Práticas: Ambientes de Banco de Dados (Dev vs Prod)
*Documento gerado em 17 de Abril de 2026*

A separação entre Desenvolvimento (Dev) e Produção (Prod) exige uma combinação de isolamento de dados, gerenciamento de variáveis de ambiente e processos de migração rigorosos. 

Abaixo estão as melhores práticas aplicadas à stack do **SprintHub** (NestJS + Prisma + Coolify):

### 1. Separação Física (ou Lógica) dos Bancos
A regra de ouro é **nunca conectar o ambiente local ou de staging ao banco de produção**.
- **Banco de Produção (`PROD`)**: Uma instância protegida dentro do provedor cloud (ex: Coolify) sem estar exposta à internet pública (Public Port desligada). Somente as aplicações (backend/workers) rodando na mesma VPC ou rede interna devem conseguir pingar essa base.
- **Banco de Desenvolvimento (`DEV`)**: Pode ser um banco rodando em um container Docker na máquina local dos desenvolvedores ou um banco cloud secundário (`sprinthub-dev`) exposto ao público, desenhado para que a equipe ágil conecte suas máquinas locais.

### 2. Gestão Pelas Variáveis de Ambiente (`.env`)
No repositório, o arquivo `.env` responsável por expor a string `DATABASE_URL` deve estar estritamente referenciado no `.gitignore`.
- **Máquina Local (Dev)**: O `.env` aponta para seu banco de Dev local ou na nuvem.
- **Servidor Cloud (Prod)**: Ao criar a aplicação backend, a *Environment Variable* `DATABASE_URL` é injetada diretamente no painel de CI/CD (ex: Painel Visual do Coolify) apontando para a rede interna (ex: `postgres://user:pass@postgresql-container-name:5432/db`). O Provedor passa isso automaticamente pro NestJS durante o build/runtime sem ser "comitado" por engano.

### 3. O Jeito "Prisma" de Manipular Schemas
O Prisma diferencia as rotinas dependendo do seu ambiente ativo:

* **Em DEV (`npx prisma db push`)**:
   Usado para prototipação rápida. Força as tabelas a tomarem o formato do código `schema.prisma` instantaneamente, destruindo tabelas localmente se necessário sem gerar arquivos de rastreamento longo.

* **Em PROD (`npx prisma migrate deploy`)**:
   Em produção não podemos correr o risco de destruir ou perder os dados ativos. A trilha segura é:
   1. Finalizar a modelagem da sprint localmente;
   2. Rodar `npx prisma migrate dev --name <nome_da_feature>` (Isso gera os arquivos `.sql` e formaliza a migration baseada nas diferenças);
   3. "Comitar" o código no Git junto com a pasta de migrações;
   4. A automação do provedor CI/CD (Coolify/Nixpacks), ao levantar a aplicação, executará o `npx prisma migrate deploy`. Isso valida os SQL testados na base sem causar deriva.

### 4. Automatização e Seed de Dados de Teste
Como bancos locais ou de dev rotativos podem ser expurgados, é recomendado criar uma rotina de injeção automática de massa de dados.
- Configurar o arquivo gerador em `prisma/seed.ts`.
- Rodar o comando padronizado `npx prisma db seed` localmente.
- O script injeta rapidamente: Níveis de acesso de sistema, "User Admin Padrão", "Projeto MVP"  para que não haja trabalho manual para abrir a UI em estado funcional caso o banco Dev desabe ou reinicie do zero.
