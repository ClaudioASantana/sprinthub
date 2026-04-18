# Story 012 - Automação da Esteira de Deploy do Backend

## Descrição
Como Administrador de Infraestrutura/DevOps,
Quero conectar o repositório do GitHub ao Coolify e apontar a rota certa para o empacotamento,
Para que as atualizações do Backend e as Migrações de banco ocorram automaticamente (Zero-Downtime) e de forma segura nas esferas de produção.

## Trabalhos Realizados (Prontos)
No repositório, preparamos os gatilhos:
- `apps/backend/nixpacks.toml`: Definindo o motor de compilação.
- `apps/backend/package.json`: Adoção nativa de `npx prisma generate` (na build) e `npx prisma migrate deploy` (no start).

## Critérios de Aceite (Tarefas Manuais pelo Coolify)

Para declarar que a integração está perfeita, alguém deve fazer o "Setup" na interface do Coolify, conferindo:
- [ ] O projeto `SprintHub` deve ser criado no painel Projects do Coolify.
- [ ] Criar um "New Resource -> Application" via GitHub.
- [ ] Conectar ao seu Repositório do `sprinthub` (provavelmente na branch `main` ou `producao`).
- [ ] Em configurações (Settings) -> Preencher o diretório base: `apps/backend`
- [ ] Em configurações (Environment Variables) -> Mapear as variáveis estritas necessárias para prod, **principalmente** a `DATABASE_URL` privada/isolada para o banco Prod.
- [ ] Disparar o "Deploy".
- [ ] O terminal de log constatar sucesso nas Migrations e na abertura da API `NestJS`.

## Notas Técnicas Adicionais
* O Nixpacks foi padronizado para chamar apenas os arquivos da API. Futuros scripts para deploy do `apps/frontend` e do `sprinthub-admin` ganharão pipelines isolados como outras sub-aplicações dentro do mesmo repositório do Coolify.
