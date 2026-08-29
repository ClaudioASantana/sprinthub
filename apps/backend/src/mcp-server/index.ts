import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const server = new Server(
  {
    name: 'sprinthub-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define as ferramentas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_tasks',
        description: 'Lista as tarefas (backlog) de um projeto específico no SprintHub',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'ID do projeto no SprintHub. Se vazio, lista as tarefas de todos os projetos disponíveis.',
            },
          },
        },
      },
      {
        name: 'update_task_status',
        description: 'Atualiza o status de uma tarefa no SprintHub',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'O ID da tarefa (UUID)',
            },
            status: {
              type: 'string',
              description: 'Novo status. Valores aceitos: todo, in_progress, done',
            },
          },
          required: ['taskId', 'status'],
        },
      },
      {
        name: 'estimate_task',
        description: 'Atribui Story Points a uma tarefa no SprintHub',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'O ID da tarefa (UUID)',
            },
            storyPoints: {
              type: 'number',
              description: 'Número de story points (ex: 1, 2, 3, 5, 8)',
            },
          },
          required: ['taskId', 'storyPoints'],
        },
      }
    ],
  };
});

// Implementa as ferramentas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'list_tasks') {
      const projectId = args?.projectId as string | undefined;
      
      const whereClause = projectId ? { projectId } : {};
      const tasks = await prisma.task.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          storyPoints: true,
          type: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(tasks, null, 2),
          },
        ],
      };
    }

    if (name === 'update_task_status') {
      const taskId = args?.taskId as string;
      const status = args?.status as string;

      if (!taskId || !status) {
        throw new Error('taskId e status são obrigatórios');
      }

      const updated = await prisma.task.update({
        where: { id: taskId },
        data: { status }
      });

      return {
        content: [
          {
            type: 'text',
            text: `Status da tarefa "${updated.title}" alterado com sucesso para "${status}"`,
          },
        ],
      };
    }

    if (name === 'estimate_task') {
      const taskId = args?.taskId as string;
      const storyPoints = args?.storyPoints as number;

      if (!taskId || storyPoints === undefined) {
        throw new Error('taskId e storyPoints são obrigatórios');
      }

      const updated = await prisma.task.update({
        where: { id: taskId },
        data: { storyPoints }
      });

      return {
        content: [
          {
            type: 'text',
            text: `Story Points da tarefa "${updated.title}" definidos para ${storyPoints}`,
          },
        ],
      };
    }

    throw new Error(`Tool desconhecida: ${name}`);
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
