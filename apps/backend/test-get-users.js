const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, companyId: true }
  });
  console.table(users);
  
  const companies = await prisma.company.findMany({
    select: { id: true, name: true, email: true }
  });
  console.table(companies);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
