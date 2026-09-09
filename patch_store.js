const fs = require('fs');
let c = fs.readFileSync('app/actions/store.ts', 'utf8');

if (!c.includes('cancelExpiredCashOrders')) {
    const cancelCode = `async function cancelExpiredCashOrders() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const expiredTxs = await prisma.transaction.findMany({
    where: {
      status: 'PENDING_DELIVERY',
      paymentMethod: 'Efectivo',
      date: { lt: twentyFourHoursAgo }
    },
    include: { items: true }
  });

  for (const tx of expiredTxs) {
    await prisma.transaction.update({ where: { id: tx.id }, data: { status: 'CANCELED' } });
    for (const item of tx.items) {
      if (!['MEMB', 'COACH'].includes(item.productId)) {
        const prod = await prisma.product.findUnique({ where: { id: item.productId } });
        if (prod) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.qty } }
          });
        }
      }
    }
  }
}

`;
    c = c.replace('export async function getPendingTransactions() {', cancelCode + 'export async function getPendingTransactions() {\n  await cancelExpiredCashOrders();');
    fs.writeFileSync('app/actions/store.ts', c, 'utf8');
    console.log('Added cancelExpiredCashOrders to store.ts');
}
