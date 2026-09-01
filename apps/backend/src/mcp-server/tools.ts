/**
 * Definições e implementação das tools do MCP Server.
 *
 * Separado de index.ts de propósito: aquele arquivo instancia PrismaClient,
 * cria o Server e conecta o transporte stdio em top-level, então importá-lo
 * num teste subiria um servidor. Aqui não há efeito colateral de import — o
 * PrismaClient entra por parâmetro, o que também permite injetar um fake nos
 * testes.
 */
import { PrismaClient } from '@prisma/client';

// Espelha os comentários de enum em prisma/schema.prisma (Task.status/priority/type).
export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export const TASK_TYPES = ['story', 'bug', 'task', 'epic'] as const;

// A index signature existe para o tipo casar com o `ServerResult` do SDK, que
// é uma união aberta — sem ela o TS escolhe o membro errado da união.
export interface ToolResult {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
}

type ToolArgs = Record<string, unknown> | undefined;

export function assertOneOf(
  value: unknown,
  allowed: readonly string[],
  field: string,
): string {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new Error(
      `${field} inválido: ${JSON.stringify(value)}. Valores aceitos: ${allowed.join(', ')}`,
    );
  }
  return value;
}

/**
 * Garante que a sprint pertence ao mesmo projeto da tarefa. Sem isso a tarefa
 * migra de projeto (e de empresa) na prática: o banco não tem constraint
 * ligando Task.projectId a Sprint.projectId.
 */
export async function assertSprintBelongsToProject(
  prisma: PrismaClient,
  sprintId: string,
  projectId: string,
): Promise<void> {
  const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
  if (!sprint) {
    throw new Error(`Sprint "${sprintId}" não existe.`);
  }
  if (sprint.projectId !== projectId) {
    throw new Error(
      `Sprint "${sprintId}" pertence ao projeto ${sprint.projectId}, ` +
        `mas a tarefa está no projeto ${projectId}. Escolha uma sprint do mesmo projeto.`,
    );
  }
}

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// Tipado explicitamente (em vez de `as const`) para o array continuar mutável e
// o `type: 'object'` continuar sendo o literal que o SDK do MCP exige.
export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'list_tasks',
    description:
      'Lista as tarefas (backlog) de um projeto específico no SprintHub',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description:
            'ID do projeto no SprintHub. Se vazio, lista as tarefas de todos os projetos disponíveis.',
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
        taskId: { type: 'string', description: 'O ID da tarefa (UUID)' },
        status: {
          type: 'string',
          description: `Novo status. Valores aceitos: ${TASK_STATUSES.join(', ')}`,
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
        taskId: { type: 'string', description: 'O ID da tarefa (UUID)' },
        storyPoints: {
          type: 'number',
          description:
            'Número de story points, inteiro >= 0 (ex: 1, 2, 3, 5, 8)',
        },
      },
      required: ['taskId', 'storyPoints'],
    },
  },
  {
    name: 'list_projects',
    description: 'Lista os projetos do SprintHub (id, nome, empresa, status)',
    inputSchema: {
      type: 'object',
      properties: {
        companyId: {
          type: 'string',
          description:
            'ID da empresa. Se vazio, lista projetos de todas as empresas.',
        },
      },
    },
  },
  {
    name: 'list_sprints',
    description:
      'Lista as sprints de um projeto (ou de todos, se projectId vazio)',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description:
            'ID do projeto. Se vazio, lista sprints de todos os projetos.',
        },
      },
    },
  },
  {
    name: 'assign_task_to_sprint',
    description:
      'Move uma tarefa para uma sprint (ou de volta ao backlog, com sprintId null)',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'O ID da tarefa (UUID)' },
        sprintId: {
          type: ['string', 'null'],
          description:
            'ID da sprint de destino, ou null para voltar ao backlog',
        },
      },
      required: ['taskId', 'sprintId'],
    },
  },
  {
    name: 'create_task',
    description: 'Cria uma nova tarefa no backlog de um projeto do SprintHub',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'ID do projeto onde a tarefa será criada',
        },
        title: { type: 'string', description: 'Título da tarefa' },
        type: {
          type: 'string',
          description: `Tipo da tarefa. Valores aceitos: ${TASK_TYPES.join(', ')}. Default: task`,
        },
        priority: {
          type: 'string',
          description: `Prioridade. Valores aceitos: ${TASK_PRIORITIES.join(', ')}. Default: medium`,
        },
        status: {
          type: 'string',
          description: `Status inicial. Valores aceitos: ${TASK_STATUSES.join(', ')}. Default: todo`,
        },
        sprintId: {
          type: 'string',
          description:
            'ID da sprint (opcional — se vazio, a tarefa entra no backlog)',
        },
      },
      required: ['projectId', 'title'],
    },
  },
];

/**
 * Executa uma tool. Lança Error em qualquer falha — quem chama (index.ts)
 * traduz para o formato de erro do MCP.
 */
export async function dispatchTool(
  prisma: PrismaClient,
  name: string,
  args: ToolArgs,
): Promise<ToolResult> {
  if (name === 'list_tasks') {
    const projectId = args?.projectId as string | undefined;

    const tasks = await prisma.task.findMany({
      where: projectId ? { projectId } : {},
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        storyPoints: true,
        type: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(tasks, null, 2) }],
    };
  }

  if (name === 'update_task_status') {
    const taskId = args?.taskId as string;
    const status = args?.status as string;

    if (!taskId || !status) {
      throw new Error('taskId e status são obrigatórios');
    }
    assertOneOf(status, TASK_STATUSES, 'status');

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
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
    if (!Number.isInteger(storyPoints) || storyPoints < 0) {
      throw new Error(
        `storyPoints inválido: ${JSON.stringify(storyPoints)}. Precisa ser um inteiro >= 0.`,
      );
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { storyPoints },
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

  if (name === 'list_projects') {
    const companyId = args?.companyId as string | undefined;

    const projects = await prisma.project.findMany({
      where: companyId ? { companyId } : {},
      select: { id: true, name: true, companyId: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }],
    };
  }

  if (name === 'list_sprints') {
    const projectId = args?.projectId as string | undefined;

    const sprints = await prisma.sprint.findMany({
      where: projectId ? { projectId } : {},
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        capacityPoints: true,
        projectId: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(sprints, null, 2) }],
    };
  }

  if (name === 'assign_task_to_sprint') {
    const taskId = args?.taskId as string;
    const sprintId = (args?.sprintId ?? null) as string | null;

    if (!taskId) {
      throw new Error('taskId é obrigatório');
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new Error(`Tarefa "${taskId}" não existe.`);
    }

    if (sprintId !== null) {
      await assertSprintBelongsToProject(prisma, sprintId, task.projectId);
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { sprintId },
    });

    return {
      content: [
        {
          type: 'text',
          text: sprintId
            ? `Tarefa "${updated.title}" movida para a sprint ${sprintId}`
            : `Tarefa "${updated.title}" voltou para o backlog (sem sprint)`,
        },
      ],
    };
  }

  if (name === 'create_task') {
    const projectId = args?.projectId as string;
    const title = args?.title as string;
    const type = (args?.type as string | undefined) ?? 'task';
    const priority = (args?.priority as string | undefined) ?? 'medium';
    const status = (args?.status as string | undefined) ?? 'todo';
    const sprintId = args?.sprintId as string | undefined;

    if (!projectId || !title) {
      throw new Error('projectId e title são obrigatórios');
    }
    assertOneOf(type, TASK_TYPES, 'type');
    assertOneOf(priority, TASK_PRIORITIES, 'priority');
    assertOneOf(status, TASK_STATUSES, 'status');

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new Error(`Projeto "${projectId}" não existe.`);
    }
    if (sprintId) {
      await assertSprintBelongsToProject(prisma, sprintId, projectId);
    }

    const created = await prisma.task.create({
      data: { projectId, title, type, priority, status, sprintId },
    });

    return {
      content: [
        {
          type: 'text',
          text: `Tarefa "${created.title}" criada em ${projectId} (id: ${created.id})`,
        },
      ],
    };
  }

  throw new Error(`Tool desconhecida: ${name}`);
}
