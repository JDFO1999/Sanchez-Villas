const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const athlete = await prisma.user.findFirst({ where: { role: 'athlete' } });
  console.log('Athlete ID:', athlete.id);
  const txs = await prisma.transaction.findMany({ where: { customerId: athlete.id } });
  console.log('TX count for this athlete:', txs.length);
}

check().finally(() => prisma.$disconnect());
