# Deploy em servidor próprio com GitHub Actions self-hosted

Guia do que fizemos para publicar o SprintHub no servidor local
(`bankai-server`, LAN, sem exposição à internet) com deploy automático a
cada merge em `main`. Serve de roteiro para repetir com outro sistema.

## Ideia geral

1. Um runner do GitHub Actions roda **dentro do próprio servidor**, como um
   processo (systemd) que fica escutando o GitHub por HTTPS — não precisa
   abrir porta nem SSH de fora para dentro.
2. Quando dá merge em `main`, o GitHub manda o job pra esse runner, que builda
   as imagens Docker localmente e sobe com `docker compose`.
3. A app fica servida por containers: um Dockerfile por serviço que precisa de
   build (backend, frontend), e o `docker-compose.yml` orquestra tudo.

## Passo 1 — Instalar o runner no servidor

No GitHub: **Settings → Actions → Runners → New self-hosted runner**, escolher
Linux/x64. Ele te dá um script `./config.sh` com um token de registro
(single-use, expira em ~1h — não precisa guardar).

No servidor:

```bash
mkdir actions-runner && cd actions-runner
# baixar e extrair o pacote que o GitHub mostrar na tela
./config.sh --url https://github.com/<org>/<repo> --token <TOKEN>
```

`./run.sh` roda em primeiro plano (é esperado — "√ Connected to GitHub /
Listening for Jobs" é sucesso, não travamento). Para deixar rodando sempre,
instalar como serviço:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

Confirmar que o usuário do serviço consegue rodar Docker sem senha
(`docker ps` sem sudo). Se der `permission denied`:

```bash
sudo usermod -aG docker <usuario>
# sair e entrar de novo no SSH pra grupo valer
```

## Passo 2 — `.env` de produção fora do repositório

**Importante:** `actions/checkout` apaga qualquer arquivo não rastreado do
workspace do runner a cada job. Um `.env` dentro do clone seria perdido no
próximo deploy. Por isso ele mora numa pasta separada, fora do checkout:

```bash
mkdir -p ~/<projeto>-deploy
openssl rand -hex 32   # gera um segredo forte pra usar como JWT_SECRET etc.
nano ~/<projeto>-deploy/.env
chmod 600 ~/<projeto>-deploy/.env
```

O conteúdo é específico de cada app — geralmente credenciais de banco,
segredos de auth e flags. Manter um `.env.deploy.example` versionado no repo
documentando quais variáveis existem (sem os valores reais).

## Passo 3 — Dockerfiles multi-stage

Um Dockerfile por serviço que precisa de build. Pontos que já nos morderam:

- **Monorepo (pnpm/yarn/npm workspaces):** copiar todos os `package.json` dos
  workspaces antes do `install`, não só o do serviço — o lockfile é do
  monorepo inteiro.
- **Prisma em Alpine:** o schema engine quebra sem OpenSSL real —
  `RUN apk add --no-cache openssl` em **toda** stage que rodar Prisma
  (inclusive a de runtime, que geralmente parte de uma imagem `node:*-alpine`
  limpa e não herda nada da stage de build).
- **Seed/scripts que usam devDependencies** (ex: `ts-node`): se a imagem final
  só instala com `--prod`, esses comandos quebram. Ou copia o `node_modules`
  completo da stage de build, ou aceita que o seed roda fora do container.
- **Build output em caminho inesperado:** `nest build` sem `rootDir` fixo no
  `tsconfig.json` pode gerar `dist/src/main.js` em vez de `dist/main.js` se
  houver arquivos fora de `src/` incluídos no cálculo da raiz (ex: scripts de
  seed no Prisma). Testar o `CMD`/`start` localmente antes de confiar no
  script `start:prod` do `package.json`.
- **Variáveis de build-time vs runtime:** frameworks que fazem bundle no
  frontend (Vite, Next em modo estático, CRA) **embutem** variáveis de
  ambiente no JS gerado. Elas têm que entrar como `ARG` do Dockerfile
  (`--build-arg`), não como `environment:` do container — trocar depois exige
  rebuildar a imagem.

## Passo 4 — nginx como proxy para SPA + API

Frontend estático servido por nginx, com fallback de rota (`try_files ...
/index.html`) e proxy reverso pro backend usando o **nome do serviço** do
compose (`proxy_pass http://backend:3005`), não `localhost` — dentro da rede
do compose, containers se enxergam pelo nome do serviço.

## Passo 5 — `docker-compose.yml`

Orquestra banco + backend + frontend. Usar `${VAR:-default}` para manter o
compose funcionando em dev local sem exigir um `.env`. Cuidado com
`container_name` fixo: se o servidor já roda outro projeto que usa o mesmo
nome, o compose vai falhar — checar `docker ps` antes.

## Passo 6 — Workflow de deploy

```yaml
name: Deploy
on:
  push:
    branches: [main]
concurrency:
  group: deploy-main
  cancel-in-progress: false
jobs:
  deploy:
    runs-on: self-hosted
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - name: Subir containers
        run: docker compose --env-file ~/<projeto>-deploy/.env up -d --build
      - name: Limpar imagens antigas
        run: docker image prune -f
```

`runs-on: self-hosted` é o que manda o job pro runner instalado no servidor
em vez de uma máquina do GitHub.

## Passo 7 — Primeiro deploy

1. Merge do PR pra `main` → o workflow dispara sozinho.
2. Acompanhar em **Actions** no GitHub, ou `docker ps` / `docker compose logs
   -f` no servidor (o compose file usado pelo runner fica dentro do
   workspace dele, algo como `~/actions-runner/_work/<repo>/<repo>/`).
3. Banco novo = sem dados. Rodar o seed manualmente uma vez:
   ```bash
   docker compose exec backend npx prisma db seed
   ```
4. Testar a URL publicada (`http://<ip-do-servidor>:<porta>`).

## Coisas a decidir por sistema (não copiar sem pensar)

- **Auth:** se o sistema não tem um provedor de login pronto pra produção
  (nosso caso — ver `docs/stories/032-autenticacao-real-dev-login.md`),
  decidir explicitamente o que substitui isso, e documentar como dívida
  técnica. Só é aceitável em servidor sem exposição à internet.
- **Portas publicadas:** conferir com `docker ps` que a porta escolhida não
  colide com outro serviço já rodando no servidor.
- **Nomes de container:** idem — nomes fixos colidem entre projetos.
