# Story 011 - Configuração de Banco em Nuvem e Deploy

## Descrição
Como Administrador de Infraestrutura,
Quero migrar o banco de dados PostgreSQL do ambiente local para uma instância em Nuvem (como Coolify),
Para garantir alta disponibilidade, acesso remoto e viabilizar o deploy do Painel e do Cliente em produção.

## Critérios de Aceite
- [x] Obter as credenciais finais de um banco PostgreSQL em Nuvem (produção).
- [x] Atualizar o arquivo `apps/backend/.env` com as variáveis de conexão `DATABASE_URL` remotas.
- [x] Executar o `npx prisma db push` (ou `prisma migrate deploy`) conectando à nuvem para instanciar as tabelas.
- [x] Testar a conexão abrindo o Prisma Studio conectado ao banco em nuvem.
- [x] (Opcional) Preparar o arquivo `docker-compose.yml` final ou Nixpacks para a aplicação backend se preparar para o deploy.

## Technical Notes
- Provider Cloud: (A definir, preferencialmente Coolify).
- O backend deve continuar funcionando em desenvolvimento, porém apontando para essa Base Central.
