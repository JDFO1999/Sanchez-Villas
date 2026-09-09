const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const txs = await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    take: 5,
    include: { items: true, customer: true }
  });
  console.log(JSON.stringify(txs, null, 2));
}

check().finally(() => prisma.$disconnect());
