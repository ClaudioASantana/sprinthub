import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** IDs estáveis para deep-links e re-seed idempotente */
export const DEMO = {
  companyId: 'company-demo-id',
  teamId: 'team-sprinthub',
  projectAlphaId: 'project-1',
  projectCoreId: 'project-sprinthub-core',
  sprintPastId: 'sprint-core-past',
  sprintActiveId: 'sprint-core-active',
  users: {
    po: 'user-demo-po',
    dev1: 'user-demo-dev1',
    dev2: 'user-demo-dev2',
  },
} as const;

type TaskSeed = {
  id: string;
  title: string;
  description?: string;
  type: 'epic' | 'story' | 'task' | 'bug';
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  storyPoints?: number;
  sprintId?: string | null;
  assigneeId?: string | null;
};

async function main() {
  console.log('Seed starting (SprintHub Core demo)...');

  const company = await prisma.company.upsert({
    where: { cnpj: '12345678000100' },
    update: {
      name: 'Empresa Demo',
      responsible: 'Admin Demo',
      email: 'admin@demo.com',
      active: true,
    },
    create: {
      id: DEMO.companyId,
      name: 'Empresa Demo',
      cnpj: '12345678000100',
      responsible: 'Admin Demo',
      email: 'admin@demo.com',
      active: true,
    },
  });

  const team = await prisma.team.upsert({
    where: { id: DEMO.teamId },
    update: {
      name: 'Time SprintHub',
      description: 'Product + Engineering do SprintHub',
      active: true,
      companyId: company.id,
    },
    create: {
      id: DEMO.teamId,
      name: 'Time SprintHub',
      description: 'Product + Engineering do SprintHub',
      active: true,
      companyId: company.id,
    },
  });

  // Mantém time legado do seed antigo (compat)
  await prisma.team.upsert({
    where: { id: 'team-1' },
    update: {},
    create: {
      id: 'team-1',
      name: 'Time Frontend',
      description: 'Desenvolvimento Vue.js',
      active: true,
      companyId: company.id,
    },
  });

  const userPo = await prisma.user.upsert({
    where: { email: 'po@demo.com' },
    update: {
      name: 'Ana PO',
      role: 'admin',
      active: true,
      companyId: company.id,
      teamId: team.id,
    },
    create: {
      id: DEMO.users.po,
      email: 'po@demo.com',
      name: 'Ana PO',
      role: 'admin',
      active: true,
      companyId: company.id,
      teamId: team.id,
    },
  });

  const userDev1 = await prisma.user.upsert({
    where: { email: 'dev1@demo.com' },
    update: {
      name: 'Bruno Dev',
      role: 'member',
      active: true,
      companyId: company.id,
      teamId: team.id,
    },
    create: {
      id: DEMO.users.dev1,
      email: 'dev1@demo.com',
      name: 'Bruno Dev',
      role: 'member',
      active: true,
      companyId: company.id,
      teamId: team.id,
    },
  });

  const userDev2 = await prisma.user.upsert({
    where: { email: 'dev2@demo.com' },
    update: {
      name: 'Carla Dev',
      role: 'member',
      active: true,
      companyId: company.id,
      teamId: team.id,
    },
    create: {
      id: DEMO.users.dev2,
      email: 'dev2@demo.com',
      name: 'Carla Dev',
      role: 'member',
      active: true,
      companyId: company.id,
      teamId: team.id,
    },
  });

  // Projeto legado (leve)
  await prisma.project.upsert({
    where: { id: DEMO.projectAlphaId },
    update: {},
    create: {
      id: DEMO.projectAlphaId,
      name: 'Projeto Alpha',
      description: 'Projeto legado do seed inicial',
      status: 'active',
      companyId: company.id,
      teamId: 'team-1',
    },
  });

  const projectCore = await prisma.project.upsert({
    where: { id: DEMO.projectCoreId },
    update: {
      name: 'SprintHub Core',
      description:
        'Dogfood do próprio SprintHub — hub, backlog, board e métricas (stories 016–024).',
      status: 'active',
      companyId: company.id,
      teamId: team.id,
      startDate: daysAgo(60),
    },
    create: {
      id: DEMO.projectCoreId,
      name: 'SprintHub Core',
      description:
        'Dogfood do próprio SprintHub — hub, backlog, board e métricas (stories 016–024).',
      status: 'active',
      companyId: company.id,
      teamId: team.id,
      startDate: daysAgo(60),
    },
  });

  const sprintPast = await prisma.sprint.upsert({
    where: { id: DEMO.sprintPastId },
    update: {
      name: 'Sprint 0 — Fundação',
      goal: 'MVP estável: auth, projetos, kanban básico',
      status: 'completed',
      startDate: daysAgo(28),
      endDate: daysAgo(14),
      projectId: projectCore.id,
      capacityPoints: 30,
    },
    create: {
      id: DEMO.sprintPastId,
      name: 'Sprint 0 — Fundação',
      goal: 'MVP estável: auth, projetos, kanban básico',
      status: 'completed',
      startDate: daysAgo(28),
      endDate: daysAgo(14),
      projectId: projectCore.id,
      capacityPoints: 30,
    },
  });

  const sprintActive = await prisma.sprint.upsert({
    where: { id: DEMO.sprintActiveId },
    update: {
      name: 'Sprint 1 — Hub & Acompanhamento',
      goal: 'Hub do projeto, overview e seed demo (017–019)',
      status: 'active',
      startDate: daysAgo(3),
      endDate: daysFromNow(11),
      projectId: projectCore.id,
      capacityPoints: 40,
    },
    create: {
      id: DEMO.sprintActiveId,
      name: 'Sprint 1 — Hub & Acompanhamento',
      goal: 'Hub do projeto, overview e seed demo (017–019)',
      status: 'active',
      startDate: daysAgo(3),
      endDate: daysFromNow(11),
      projectId: projectCore.id,
      capacityPoints: 40,
    },
  });

  const tasks: TaskSeed[] = [
    // Sprint passado (done)
    {
      id: 'task-core-001',
      title: 'Story 013 — Frontend Kanban',
      description: 'Board com colunas e cards',
      type: 'story',
      status: 'done',
      priority: 'high',
      storyPoints: 5,
      sprintId: sprintPast.id,
      assigneeId: userDev1.id,
    },
    {
      id: 'task-core-002',
      title: 'Story 014 — Kanban inteligente',
      description: 'Filtro sprint/backlog + assignees',
      type: 'story',
      status: 'done',
      priority: 'high',
      storyPoints: 8,
      sprintId: sprintPast.id,
      assigneeId: userDev2.id,
    },
    {
      id: 'task-core-003',
      title: 'Story 015 — Dashboard overview',
      description: 'GET /stats + cards no home',
      type: 'story',
      status: 'done',
      priority: 'medium',
      storyPoints: 3,
      sprintId: sprintPast.id,
      assigneeId: userDev1.id,
    },
    {
      id: 'task-core-004',
      title: 'Fix proxy Vite 404 API',
      type: 'bug',
      status: 'done',
      priority: 'high',
      storyPoints: 2,
      sprintId: sprintPast.id,
      assigneeId: userDev2.id,
    },

    // Sprint ativo
    {
      id: 'task-core-epic-hub',
      title: 'Epic — Hub do Projeto',
      description: 'Abas Overview / Backlog / Board / Sprints',
      type: 'epic',
      status: 'in_progress',
      priority: 'high',
      storyPoints: 13,
      sprintId: sprintActive.id,
      assigneeId: userPo.id,
    },
    {
      id: 'task-core-017',
      title: 'Story 017 — Hub do projeto (abas)',
      description: 'Shell com deep-link por projectId',
      type: 'story',
      status: 'todo',
      priority: 'high',
      storyPoints: 5,
      sprintId: sprintActive.id,
      assigneeId: userDev1.id,
    },
    {
      id: 'task-core-018',
      title: 'Story 018 — Overview do projeto',
      description: 'Métricas por projeto + progresso do sprint ativo',
      type: 'story',
      status: 'todo',
      priority: 'high',
      storyPoints: 5,
      sprintId: sprintActive.id,
      assigneeId: userDev2.id,
    },
    {
      id: 'task-core-019',
      title: 'Story 019 — Seed demo SprintHub Core',
      description: 'Dados realistas para dogfood',
      type: 'story',
      status: 'in_progress',
      priority: 'high',
      storyPoints: 3,
      sprintId: sprintActive.id,
      assigneeId: userDev1.id,
    },
    {
      id: 'task-core-016',
      title: 'Story 016 — Comentários nas tarefas',
      description: 'Comment model + UI no painel do card',
      type: 'story',
      status: 'todo',
      priority: 'medium',
      storyPoints: 5,
      sprintId: sprintActive.id,
      assigneeId: userDev2.id,
    },
    {
      id: 'task-core-avatar',
      title: 'Avatares nos cards do Kanban',
      type: 'task',
      status: 'todo',
      priority: 'low',
      storyPoints: 2,
      sprintId: sprintActive.id,
      assigneeId: userDev1.id,
    },

    // Product backlog
    {
      id: 'task-core-020',
      title: 'Story 020 — Arrastar backlog → sprint',
      type: 'story',
      status: 'todo',
      priority: 'high',
      storyPoints: 8,
      sprintId: null,
      assigneeId: null,
    },
    {
      id: 'task-core-021',
      title: 'Story 021 — Board default = sprint ativo',
      type: 'story',
      status: 'todo',
      priority: 'medium',
      storyPoints: 2,
      sprintId: null,
      assigneeId: null,
    },
    {
      id: 'task-core-022',
      title: 'Story 022 — Capacidade / story points no sprint',
      type: 'story',
      status: 'todo',
      priority: 'medium',
      storyPoints: 5,
      sprintId: null,
      assigneeId: null,
    },
    {
      id: 'task-core-023',
      title: 'Story 023 — Burndown do sprint',
      type: 'story',
      status: 'todo',
      priority: 'medium',
      storyPoints: 8,
      sprintId: null,
      assigneeId: null,
    },
    {
      id: 'task-core-024',
      title: 'Story 024 — Velocity (últimos N sprints)',
      type: 'story',
      status: 'todo',
      priority: 'low',
      storyPoints: 5,
      sprintId: null,
      assigneeId: null,
    },
    {
      id: 'task-core-025',
      title: 'Story 025 — Sync Issues GitHub → Tasks',
      description: 'Integração (épico GitHub) — depois do hub interno',
      type: 'story',
      status: 'todo',
      priority: 'low',
      storyPoints: 13,
      sprintId: null,
      assigneeId: null,
    },
    {
      id: 'task-core-bug-empty',
      title: 'Board vazio confunde novos usuários',
      description: 'Melhorar empty state quando não há tasks',
      type: 'bug',
      status: 'todo',
      priority: 'medium',
      storyPoints: 1,
      sprintId: null,
      assigneeId: userPo.id,
    },
  ];

  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        description: t.description ?? null,
        type: t.type,
        status: t.status,
        priority: t.priority,
        storyPoints: t.storyPoints ?? null,
        projectId: projectCore.id,
        sprintId: t.sprintId ?? null,
        assigneeId: t.assigneeId ?? null,
      },
      create: {
        id: t.id,
        title: t.title,
        description: t.description ?? null,
        type: t.type,
        status: t.status,
        priority: t.priority,
        storyPoints: t.storyPoints ?? null,
        projectId: projectCore.id,
        sprintId: t.sprintId ?? null,
        assigneeId: t.assigneeId ?? null,
      },
    });
  }

  // Tasks mínimas do Projeto Alpha (compat seed antigo)
  const alphaSprint = await prisma.sprint.upsert({
    where: { id: 'sprint-1' },
    update: {},
    create: {
      id: 'sprint-1',
      name: 'Sprint 1',
      goal: 'Setup inicial do projeto',
      status: 'active',
      startDate: new Date(),
      endDate: daysFromNow(14),
      projectId: DEMO.projectAlphaId,
    },
  });

  for (const t of [
    {
      id: 'task-1',
      title: 'Criar layout base',
      status: 'done' as const,
      type: 'task' as const,
    },
    {
      id: 'task-2',
      title: 'Implementar autenticação',
      status: 'in_progress' as const,
      type: 'story' as const,
    },
    {
      id: 'task-3',
      title: 'Configurar CI/CD',
      status: 'todo' as const,
      type: 'task' as const,
    },
  ]) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        title: t.title,
        type: t.type,
        status: t.status,
        priority: 'medium',
        projectId: DEMO.projectAlphaId,
        sprintId: alphaSprint.id,
      },
    });
  }

  console.log('Seed completed!');
  console.log('');
  console.log('Demo dogfood:');
  console.log(`  Project:  SprintHub Core (${DEMO.projectCoreId})`);
  console.log(`  Deep link board: /app/project/${DEMO.projectCoreId}`);
  console.log(`  Users: po@demo.com, dev1@demo.com, dev2@demo.com`);
  console.log(`  Login local: POST /api/auth/dev-login { "email": "po@demo.com", "role": "admin" }`);
  console.log('');
  console.log('Re-seed:  make db-seed   |   cd apps/backend && npx prisma db seed');
  console.log('Reset DB+seed (dev):  make db-init');
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
