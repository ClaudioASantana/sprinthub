import { PrismaClient } from '@prisma/client';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
  TOOL_DEFINITIONS,
  assertOneOf,
  dispatchTool,
} from './tools';

type Row = Record<string, unknown> & { id: string };

interface Seed {
  tasks?: Row[];
  sprints?: Row[];
  projects?: Row[];
}

interface WhereId {
  where: { id: string };
}
interface WhereMany {
  where?: Record<string, unknown>;
}

/**
 * Prisma falso, em memória. Só implementa o que as tools usam: findUnique por
 * id, findMany com where de igualdade simples, update e create.
 *
 * `select` e `orderBy` são deliberadamente ignorados — quem os aplica é o
 * Prisma de verdade. O que os testes verificam aqui é a lógica das tools:
 * validação, guardas e o que é passado pro banco.
 */
function makePrisma(seed: Seed = {}) {
  const tasks: Row[] = seed.tasks ? seed.tasks.map((t) => ({ ...t })) : [];
  const sprints: Row[] = seed.sprints
    ? seed.sprints.map((s) => ({ ...s }))
    : [];
  const projects: Row[] = seed.projects
    ? seed.projects.map((p) => ({ ...p }))
    : [];

  const findUnique = (rows: Row[]) =>
    jest.fn((args: WhereId) =>
      Promise.resolve(rows.find((r) => r.id === args.where.id) ?? null),
    );

  const findMany = (rows: Row[]) =>
    jest.fn((args?: WhereMany) => {
      const where = args?.where ?? {};
      return Promise.resolve(
        rows.filter((r) => Object.entries(where).every(([k, v]) => r[k] === v)),
      );
    });

  let created = 0;

  const client = {
    task: {
      findUnique: findUnique(tasks),
      findMany: findMany(tasks),
      update: jest.fn((args: WhereId & { data: Record<string, unknown> }) => {
        const row = tasks.find((t) => t.id === args.where.id);
        if (!row) {
          return Promise.reject(new Error('Record to update not found.'));
        }
        Object.assign(row, args.data);
        return Promise.resolve(row);
      }),
      create: jest.fn((args: { data: Record<string, unknown> }) => {
        created += 1;
        const row: Row = { ...args.data, id: `new-task-${created}` };
        tasks.push(row);
        return Promise.resolve(row);
      }),
    },
    sprint: {
      findUnique: findUnique(sprints),
      findMany: findMany(sprints),
    },
    project: {
      findUnique: findUnique(projects),
      findMany: findMany(projects),
    },
  };

  return { prisma: client as unknown as PrismaClient, client, tasks };
}

/** Atalho: o texto do primeiro (e único) bloco de content. */
function textOf(result: { content: Array<{ text: string }> }) {
  return result.content[0].text;
}

/** As tools de listagem devolvem o JSON das linhas dentro do bloco de texto. */
function rowsOf(result: { content: Array<{ text: string }> }): Row[] {
  return JSON.parse(textOf(result)) as Row[];
}

const PROJECT_A = 'proj-a';
const PROJECT_B = 'proj-b';

function defaultSeed(): Seed {
  return {
    projects: [
      { id: PROJECT_A, name: 'Alpha', companyId: 'co-1', status: 'active' },
      { id: PROJECT_B, name: 'Beta', companyId: 'co-2', status: 'active' },
    ],
    sprints: [
      { id: 'sprint-a1', name: 'A1', projectId: PROJECT_A, status: 'active' },
      { id: 'sprint-b1', name: 'B1', projectId: PROJECT_B, status: 'active' },
    ],
    tasks: [
      {
        id: 'task-a1',
        title: 'Tarefa A1',
        projectId: PROJECT_A,
        sprintId: null,
        status: 'todo',
        priority: 'medium',
        type: 'task',
        storyPoints: null,
      },
      {
        id: 'task-b1',
        title: 'Tarefa B1',
        projectId: PROJECT_B,
        sprintId: null,
        status: 'todo',
        priority: 'high',
        type: 'bug',
        storyPoints: null,
      },
    ],
  };
}

describe('assertOneOf', () => {
  it('devolve o valor quando ele está na lista', () => {
    expect(assertOneOf('todo', TASK_STATUSES, 'status')).toBe('todo');
  });

  it('lança listando os valores aceitos', () => {
    expect(() => assertOneOf('review', TASK_STATUSES, 'status')).toThrow(
      'status inválido: "review". Valores aceitos: todo, in_progress, done',
    );
  });

  it('rejeita valores que não são string', () => {
    expect(() => assertOneOf(undefined, TASK_STATUSES, 'status')).toThrow(
      /status inválido/,
    );
    expect(() => assertOneOf(1, TASK_STATUSES, 'status')).toThrow(
      /status inválido/,
    );
  });
});

describe('TOOL_DEFINITIONS', () => {
  it('expõe as 7 tools com nomes únicos', () => {
    const names = TOOL_DEFINITIONS.map((t) => t.name);
    expect(names).toEqual([
      'list_tasks',
      'update_task_status',
      'estimate_task',
      'list_projects',
      'list_sprints',
      'assign_task_to_sprint',
      'create_task',
    ]);
    expect(new Set(names).size).toBe(names.length);
  });

  it('descreve todas as tools com inputSchema de objeto', () => {
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.properties).toBeTruthy();
    }
  });

  // Trava a descrição contra as constantes: se alguém adicionar um status novo
  // e esquecer da descrição, o cliente MCP passa a receber um enum defasado.
  it('lista os enums vigentes nas descrições', () => {
    const byName = Object.fromEntries(TOOL_DEFINITIONS.map((t) => [t.name, t]));
    const statusDesc = (byName.update_task_status.inputSchema.properties as any)
      .status.description;
    expect(statusDesc).toContain(TASK_STATUSES.join(', '));

    const createProps = byName.create_task.inputSchema.properties as any;
    expect(createProps.type.description).toContain(TASK_TYPES.join(', '));
    expect(createProps.priority.description).toContain(
      TASK_PRIORITIES.join(', '),
    );
  });
});

describe('dispatchTool', () => {
  it('lança em tool desconhecida', async () => {
    const { prisma } = makePrisma();
    await expect(dispatchTool(prisma, 'nope', {})).rejects.toThrow(
      'Tool desconhecida: nope',
    );
  });

  describe('list_tasks', () => {
    it('sem projectId, consulta sem filtro', async () => {
      const { prisma, client } = makePrisma(defaultSeed());
      const result = await dispatchTool(prisma, 'list_tasks', {});

      expect(client.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
      expect(rowsOf(result)).toHaveLength(2);
    });

    it('com projectId, filtra pelo projeto', async () => {
      const { prisma, client } = makePrisma(defaultSeed());
      const result = await dispatchTool(prisma, 'list_tasks', {
        projectId: PROJECT_A,
      });

      expect(client.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { projectId: PROJECT_A } }),
      );
      const rows = rowsOf(result);
      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe('task-a1');
    });
  });

  describe('update_task_status', () => {
    it('atualiza quando o status é válido', async () => {
      const { prisma, client, tasks } = makePrisma(defaultSeed());
      const result = await dispatchTool(prisma, 'update_task_status', {
        taskId: 'task-a1',
        status: 'in_progress',
      });

      expect(client.task.update).toHaveBeenCalledWith({
        where: { id: 'task-a1' },
        data: { status: 'in_progress' },
      });
      expect(tasks.find((t) => t.id === 'task-a1')!.status).toBe('in_progress');
      expect(textOf(result)).toContain('Tarefa A1');
    });

    it('rejeita status fora do whitelist sem tocar no banco', async () => {
      const { prisma, client } = makePrisma(defaultSeed());
      await expect(
        dispatchTool(prisma, 'update_task_status', {
          taskId: 'task-a1',
          status: 'review',
        }),
      ).rejects.toThrow(/status inválido/);
      expect(client.task.update).not.toHaveBeenCalled();
    });

    it('exige taskId e status', async () => {
      const { prisma } = makePrisma(defaultSeed());
      await expect(
        dispatchTool(prisma, 'update_task_status', { status: 'todo' }),
      ).rejects.toThrow('taskId e status são obrigatórios');
      await expect(
        dispatchTool(prisma, 'update_task_status', { taskId: 'task-a1' }),
      ).rejects.toThrow('taskId e status são obrigatórios');
    });
  });

  describe('estimate_task', () => {
    it('aceita 0 story points', async () => {
      // Regressão: uma checagem `!storyPoints` trataria 0 como ausente.
      const { prisma, client } = makePrisma(defaultSeed());
      await dispatchTool(prisma, 'estimate_task', {
        taskId: 'task-a1',
        storyPoints: 0,
      });
      expect(client.task.update).toHaveBeenCalledWith({
        where: { id: 'task-a1' },
        data: { storyPoints: 0 },
      });
    });

    it('grava um inteiro positivo', async () => {
      const { prisma, tasks } = makePrisma(defaultSeed());
      const result = await dispatchTool(prisma, 'estimate_task', {
        taskId: 'task-a1',
        storyPoints: 8,
      });
      expect(tasks.find((t) => t.id === 'task-a1')!.storyPoints).toBe(8);
      expect(textOf(result)).toContain('8');
    });

    it.each([[-1], [2.5], ['3'], [NaN], [null]])(
      'rejeita storyPoints %p',
      async (value) => {
        const { prisma, client } = makePrisma(defaultSeed());
        await expect(
          dispatchTool(prisma, 'estimate_task', {
            taskId: 'task-a1',
            storyPoints: value,
          }),
        ).rejects.toThrow(/storyPoints inválido/);
        expect(client.task.update).not.toHaveBeenCalled();
      },
    );

    it('exige taskId e storyPoints', async () => {
      const { prisma } = makePrisma(defaultSeed());
      await expect(
        dispatchTool(prisma, 'estimate_task', { taskId: 'task-a1' }),
      ).rejects.toThrow('taskId e storyPoints são obrigatórios');
    });
  });

  describe('list_projects', () => {
    it('sem companyId, lista todos', async () => {
      const { prisma } = makePrisma(defaultSeed());
      const rows = rowsOf(await dispatchTool(prisma, 'list_projects', {}));
      expect(rows).toHaveLength(2);
    });

    it('filtra por companyId', async () => {
      const { prisma, client } = makePrisma(defaultSeed());
      const rows = rowsOf(
        await dispatchTool(prisma, 'list_projects', { companyId: 'co-1' }),
      );
      expect(client.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { companyId: 'co-1' } }),
      );
      expect(rows.map((r) => r.id)).toEqual([PROJECT_A]);
    });
  });

  describe('list_sprints', () => {
    it('filtra por projectId', async () => {
      const { prisma, client } = makePrisma(defaultSeed());
      const rows = rowsOf(
        await dispatchTool(prisma, 'list_sprints', { projectId: PROJECT_B }),
      );
      expect(client.sprint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { projectId: PROJECT_B } }),
      );
      expect(rows.map((r) => r.id)).toEqual(['sprint-b1']);
    });
  });

  describe('assign_task_to_sprint', () => {
    it('move a tarefa para uma sprint do mesmo projeto', async () => {
      const { prisma, tasks } = makePrisma(defaultSeed());
      const result = await dispatchTool(prisma, 'assign_task_to_sprint', {
        taskId: 'task-a1',
        sprintId: 'sprint-a1',
      });
      expect(tasks.find((t) => t.id === 'task-a1')!.sprintId).toBe('sprint-a1');
      expect(textOf(result)).toContain('sprint-a1');
    });

    it('volta a tarefa para o backlog com sprintId null', async () => {
      const seed = defaultSeed();
      seed.tasks![0].sprintId = 'sprint-a1';
      const { prisma, client, tasks } = makePrisma(seed);

      const result = await dispatchTool(prisma, 'assign_task_to_sprint', {
        taskId: 'task-a1',
        sprintId: null,
      });

      expect(tasks.find((t) => t.id === 'task-a1')!.sprintId).toBeNull();
      expect(textOf(result)).toContain('backlog');
      // Não faz sentido validar sprint quando o destino é o backlog.
      expect(client.sprint.findUnique).not.toHaveBeenCalled();
    });

    // O núcleo da guarda: sem isso a tarefa muda de projeto (e de empresa) na
    // prática, porque o banco não liga Task.projectId a Sprint.projectId.
    it('recusa sprint de outro projeto e não atualiza nada', async () => {
      const { prisma, client, tasks } = makePrisma(defaultSeed());
      await expect(
        dispatchTool(prisma, 'assign_task_to_sprint', {
          taskId: 'task-a1',
          sprintId: 'sprint-b1',
        }),
      ).rejects.toThrow(
        `Sprint "sprint-b1" pertence ao projeto ${PROJECT_B}, mas a tarefa está no projeto ${PROJECT_A}. Escolha uma sprint do mesmo projeto.`,
      );
      expect(client.task.update).not.toHaveBeenCalled();
      expect(tasks.find((t) => t.id === 'task-a1')!.sprintId).toBeNull();
    });

    it('recusa sprint inexistente', async () => {
      const { prisma, client } = makePrisma(defaultSeed());
      await expect(
        dispatchTool(prisma, 'assign_task_to_sprint', {
          taskId: 'task-a1',
          sprintId: 'sprint-fantasma',
        }),
      ).rejects.toThrow('Sprint "sprint-fantasma" não existe.');
      expect(client.task.update).not.toHaveBeenCalled();
    });

    it('recusa tarefa inexistente', async () => {
      const { prisma, client } = makePrisma(defaultSeed());
      await expect(
        dispatchTool(prisma, 'assign_task_to_sprint', {
          taskId: 'task-fantasma',
          sprintId: 'sprint-a1',
        }),
      ).rejects.toThrow('Tarefa "task-fantasma" não existe.');
      expect(client.task.update).not.toHaveBeenCalled();
    });

    it('exige taskId', async () => {
      const { prisma } = makePrisma(defaultSeed());
      await expect(
        dispatchTool(prisma, 'assign_task_to_sprint', { sprintId: null }),
      ).rejects.toThrow('taskId é obrigatório');
    });
  });

  describe('create_task', () => {
    it('cria no backlog com os defaults task/medium/todo', async () => {
      const { prisma, client } = makePrisma(defaultSeed());
      const result = await dispatchTool(prisma, 'create_task', {
        projectId: PROJECT_A,
        title: 'Nova',
      });

      expect(client.task.create).toHaveBeenCalledWith({
        data: {
          projectId: PROJECT_A,
          title: 'Nova',
          type: 'task',
          priority: 'medium',
          status: 'todo',
          sprintId: undefined,
        },
      });
      expect(textOf(result)).toContain('Nova');
    });

    it('respeita os valores informados', async () => {
      const { prisma, client } = makePrisma(defaultSeed());
      await dispatchTool(prisma, 'create_task', {
        projectId: PROJECT_A,
        title: 'Bug crítico',
        type: 'bug',
        priority: 'high',
        status: 'in_progress',
        sprintId: 'sprint-a1',
      });

      expect(client.task.create).toHaveBeenCalledWith({
        data: {
          projectId: PROJECT_A,
          title: 'Bug crítico',
          type: 'bug',
          priority: 'high',
          status: 'in_progress',
          sprintId: 'sprint-a1',
        },
      });
    });

    it('exige projectId e title', async () => {
      const { prisma } = makePrisma(defaultSeed());
      await expect(
        dispatchTool(prisma, 'create_task', { title: 'Sem projeto' }),
      ).rejects.toThrow('projectId e title são obrigatórios');
      await expect(
        dispatchTool(prisma, 'create_task', { projectId: PROJECT_A }),
      ).rejects.toThrow('projectId e title são obrigatórios');
    });

    it.each([
      ['type', 'epico'],
      ['priority', 'critical'],
      ['status', 'review'],
    ])('rejeita %s inválido antes de consultar o banco', async (field, bad) => {
      const { prisma, client } = makePrisma(defaultSeed());
      await expect(
        dispatchTool(prisma, 'create_task', {
          projectId: PROJECT_A,
          title: 'X',
          [field]: bad,
        }),
      ).rejects.toThrow(new RegExp(`${field} inválido`));
      expect(client.project.findUnique).not.toHaveBeenCalled();
      expect(client.task.create).not.toHaveBeenCalled();
    });

    it('recusa projeto inexistente', async () => {
      const { prisma, client } = makePrisma(defaultSeed());
      await expect(
        dispatchTool(prisma, 'create_task', {
          projectId: 'proj-fantasma',
          title: 'X',
        }),
      ).rejects.toThrow('Projeto "proj-fantasma" não existe.');
      expect(client.task.create).not.toHaveBeenCalled();
    });

    it('recusa sprint de outro projeto', async () => {
      const { prisma, client } = makePrisma(defaultSeed());
      await expect(
        dispatchTool(prisma, 'create_task', {
          projectId: PROJECT_A,
          title: 'X',
          sprintId: 'sprint-b1',
        }),
      ).rejects.toThrow(/pertence ao projeto proj-b/);
      expect(client.task.create).not.toHaveBeenCalled();
    });
  });
});
