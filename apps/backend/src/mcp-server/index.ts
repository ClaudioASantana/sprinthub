/**
 * SprintHub MCP Server
 *
 * MODELO DE CONFIANÇA: este processo fala direto com o Postgres via Prisma,
 * sem passar pelos guards de auth/tenant da API REST (JwtAuthGuard,
 * assertTenant em ProjectsController etc.) — tem acesso irrestrito a todas
 * as empresas/projetos. É intencional: roda local via stdio (npx tsx),
 * invocado só por sessões de Claude Code confiáveis para orquestrar o
 * próprio backlog do SprintHub. NÃO exponha isso como server de rede
 * (HTTP/SSE) sem antes adicionar autenticação e escopo por tenant.
 *
 * Este arquivo é só o entrypoint (transporte + tradução de erro). A lógica
 * das tools vive em ./tools.ts, que não tem efeito colateral de import e
 * por isso é testável.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PrismaClient } from '@prisma/client';
import { TOOL_DEFINITIONS, dispatchTool } from './tools';

const prisma = new PrismaClient();

const server = new Server(
  {
    name: 'sprinthub-mcp-server',
    version: '1.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Define as ferramentas
// Sem async: o handler é puramente síncrono e o SDK aceita retorno direto.
server.setRequestHandler(ListToolsRequestSchema, () => {
  return { tools: TOOL_DEFINITIONS };
});

// Implementa as ferramentas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    return await dispatchTool(prisma, name, args);
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Erro ao executar a ferramenta ${name}: ${error?.message || error}`,
        },
      ],
      isError: true,
    };
  }
});

// Inicializa o servidor Stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SprintHub MCP Server rodando via Stdio!');
}

main().catch((error) => {
  console.error('Erro fatal no MCP Server:', error);
  process.exit(1);
});
