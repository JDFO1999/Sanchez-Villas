const fs = require('fs');
let c = fs.readFileSync('app/actions/users.ts', 'utf8');

c = c.replace(/const purchases = await prisma\.transaction\.findMany\(\{[\s\S]*?take: 10\s*\}\);\s*console\.log\('--- DASHBOARD FETCH FOR ATHLETE ---', athleteId\);\s*console\.log\('Found purchases:', purchases\.length\);/, `const purchases = await prisma.transaction.findMany({
      where: { customerId: athleteId },
      orderBy: { date: 'desc' },
      include: { items: true },
      take: 5
    })`);

fs.writeFileSync('app/actions/users.ts', c, 'utf8');
