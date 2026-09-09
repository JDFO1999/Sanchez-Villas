const fs = require('fs');
let c = fs.readFileSync('app/actions/store.ts', 'utf8');

if (!c.includes('cancelTransaction')) {
  c += `
export async function cancelTransaction(transactionId: string) {
  try {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { items: true }
    });

    if (!tx) return { success: false, error: 'Transacción no encontrada' };
    if (tx.status !== 'PENDING_DELIVERY') return { success: false, error: 'La transacción no está pendiente' };
    if (tx.paymentMethod !== 'Efectivo') return { success: false, error: 'Solo se pueden cancelar facturas en Efectivo' };

    await prisma.$transaction(async (txPrisma) => {
      await txPrisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'CANCELED' }
      });

      for (const item of tx.items) {
        await txPrisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.qty } }
        });
      }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
`;
  fs.writeFileSync('app/actions/store.ts', c, 'utf8');
  console.log("Added cancelTransaction");
} else {
  console.log("Already exists");
}
