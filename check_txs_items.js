const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const athlete = await prisma.user.findFirst({ where: { role: 'athlete' } });
  const txs = await prisma.transaction.findMany({ 
    where: { customerId: athlete.id },
    orderBy: { date: 'desc' },
    include: { items: true },
    take: 1 
  });
  console.log('Recent TXs:', JSON.stringify(txs, null, 2));
}

check().finally(() => prisma.$disconnect());
