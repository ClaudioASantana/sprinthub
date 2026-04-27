const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function test() {
  try {
    const project = await prisma.project.findFirst();
    if (!project) { console.log('No project'); return; }
    console.log('Using project:', project.id);
    const res = await axios.post('http://localhost:3000/api/tasks', {
      title: 'Teste Backlog Valid',
      projectId: project.id,
      sprintId: null,
      type: 'task',
      priority: 'medium',
      status: 'todo'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.log('Error:', err.response?.data || err.message);
  } finally {
    prisma.$disconnect();
  }
}
test();
