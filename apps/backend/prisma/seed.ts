import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed starting...');

  const company = await prisma.company.upsert({
    where: { cnpj: '12345678000100' },
    update: {},
    create: {
      id: 'company-demo-id',
      name: 'Empresa Demo',
      cnpj: '12345678000100',
      responsible: 'Admin Demo',
      email: 'admin@demo.com',
      active: true,
    },
  });

  const team = await prisma.team.upsert({
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

  const project = await prisma.project.upsert({
    where: { id: 'project-1' },
    update: {},
    create: {
      id: 'project-1',
      name: 'Projeto Alpha',
      description: 'Primeiro projeto SprintHub',
      status: 'active',
      companyId: company.id,
      teamId: team.id,
    },
  });

  const sprint = await prisma.sprint.upsert({
    where: { id: 'sprint-1' },
    update: {},
    create: {
      id: 'sprint-1',
      name: 'Sprint 1',
      goal: 'Setup inicial do projeto',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      projectId: project.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-1' },
    update: {},
    create: {
      id: 'task-1',
      title: 'Criar layout base',
      description: 'Setup do Vue com router e store',
      type: 'task',
      status: 'done',
      priority: 'high',
      projectId: project.id,
      sprintId: sprint.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-2' },
    update: {},
    create: {
      id: 'task-2',
      title: 'Implementar autenticação',
      description: 'Login com JWT',
      type: 'story',
      status: 'in_progress',
      priority: 'high',
      projectId: project.id,
      sprintId: sprint.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-3' },
    update: {},
    create: {
      id: 'task-3',
      title: 'Configurar CI/CD',
      description: 'GitHub Actions para deploy',
      type: 'task',
      status: 'todo',
      priority: 'medium',
      projectId: project.id,
      sprintId: sprint.id,
    },
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });