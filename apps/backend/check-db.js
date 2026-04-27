const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teams = await prisma.team.findMany({ include: { members: true } });
  const users = await prisma.user.findMany();
  console.log('--- TEAMS ---');
  console.log(JSON.stringify(teams, null, 2));
  console.log('--- USERS ---');
  console.log(JSON.stringify(users, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
