# Walkthrough: Sincronização Docs-as-Code no SprintHub

O novo módulo **SyncStoriesModule** foi implementado com sucesso no backend (NestJS) do SprintHub. Ele é a ponte entre as histórias escritas em Markdown pelo agente/usuários e o banco de dados PostgreSQL (via Prisma).

## O que foi desenvolvido

1. **Adição do `gray-matter`**:
   Instalamos essa dependência no `apps/backend` para possibilitar a leitura de meta-informações estruturadas (YAML Frontmatter) além do conteúdo puro em texto do Markdown.

2. **Criação do módulo `sync-stories`**:
   Localizado em `apps/backend/src/sync-stories`, este módulo expõe:
   - **`SyncStoriesService`**: O coração do recurso. Lê a pasta `docs/stories`, aplica o `gray-matter` em todos os `.md` e upserta na tabela `Task` usando o `title` e `projectId`.
   - **`SyncStoriesController`**: Expõe um endpoint (`POST /sync-stories/run`) para ser engatilhado sob demanda via webhooks, CRON jobs ou scripts.
   - **`SyncStoriesModule`**: Encapsula tudo e foi adicionado em `app.module.ts`.

3. **Novo formato para os Markdowns**:
   Adotamos o padrão de metadados no topo de cada arquivo. Para validar, ajustei o arquivo `docs/stories/001-authenticar-super-admin.md` da seguinte forma:
   ```markdown
   ---
   title: "Autenticar Super Admin"
   type: "story"
   status: "todo"
   priority: "high"
   storyPoints: 5
   projectId: "project-1"
   ---
   # Autenticar Super Admin
   ...
   ```

## Resultados da Verificação

Foi criado um script de testes conectando-se diretamente ao contexto do NestJS e rodamos o sincronizador.
O resultado no console foi excelente:

> [!NOTE]
> `[SyncStoriesService] Criada nova task: Autenticar Super Admin`
> `[SyncStoriesService] Arquivo 002-gerenciar-empresas.md ignorado pois não possui projectId no frontmatter.`

Isso comprova que o arquivo estruturado (001) foi lido, teve as propriedades isoladas pelo `gray-matter` e foi perfeitamente armazenado no Prisma, enquanto as demais histórias ainda puras aguardam pela mesma formatação!

Você pode testar a rota via cURL, requisição HTTP, ou prosseguir formatando os demais arquivos!
