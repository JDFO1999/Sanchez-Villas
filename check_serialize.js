const { getAthleteDashboardData } = require('./app/actions/users.ts');
// We need to run this through ts-node or Next.js context.
// Let's just create a small mock script that imports prisma directly.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const athleteId = 'cmtkeap2s0004o4wo8jtj3m2n';
  const purchases = await prisma.transaction.findMany({
    where: { customerId: athleteId },
    orderBy: { date: 'desc' },
    include: { items: true },
    take: 5
  });
  console.log("Raw Prisma:", purchases.length);
  
  const payload = { success: true, purchases };
  const serialized = JSON.parse(JSON.stringify(payload));
  console.log("Serialized purchases:", serialized.purchases.length);
}

check().finally(() => prisma.$disconnect());
