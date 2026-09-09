"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { saveBase64Image } from "@/lib/image-utils"

export async function getProducts() {
  try {
    const products = await prisma.product.findMany()
    return { success: true, products }
  } catch (error: any) {
    return { success: false, error: error.message, products: [] }
  }
}

export async function createProduct(data: any) {
  try {
    const imageUrl = await saveBase64Image(data.imageUrl);
    const product = await prisma.product.create({
      data: {
        barcode: data.barcode,
        name: data.name,
        price: parseFloat(data.price),
        cost: parseFloat(data.cost),
        stock: parseInt(data.stock),
        category: data.category,
        imageUrl: imageUrl || null
      }
    })
    revalidatePath('/tienda');
    revalidatePath('/');
    return { success: true, product }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const imageUrl = await saveBase64Image(data.imageUrl);
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        price: parseFloat(data.price),
        cost: parseFloat(data.cost),
        stock: parseInt(data.stock),
        category: data.category,
        imageUrl: imageUrl || null
      }
    })
    revalidatePath('/tienda');
    revalidatePath('/');
    return { success: true, product }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/tienda');
    revalidatePath('/');
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createTransaction(data: any) {
  try {
    const receiptImage = await saveBase64Image(data.receiptImage);
    
    // Start a transaction to ensure all or nothing
    const transaction = await prisma.$transaction(async (tx) => {
      // 0. Encontrar el turno de caja abierto del cajero (si hay cajero)
      let activeSession = null;
      if (data.cashierId) {
        activeSession = await tx.cashSession.findFirst({
          where: { cashierId: data.cashierId, status: 'OPEN' }
        });
      }

      // 1. Create the main transaction
      const newTx = await tx.transaction.create({
        data: {
          cashierId: data.cashierId,
          cashSessionId: activeSession ? activeSession.id : null,
          customerId: data.customerId || null,
          subtotal: parseFloat(data.subtotal),
          tax: parseFloat(data.tax),
          total: parseFloat(data.total),
          paymentMethod: data.paymentMethod,
          reference: data.reference || null,
          receiptImage: receiptImage || null,
          status: data.cashierId ? 'COMPLETED' : 'PENDING_DELIVERY',
          items: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              name: item.name,
              price: parseFloat(item.price),
              qty: parseInt(item.qty),
              subtotal: parseFloat(item.subtotal)
            }))
          }
        },
        include: {
          items: true
        }
      });

      // 2. Decrement stock for real products
      for (const item of data.items) {
        if (!['MEMB', 'COACH'].includes(item.productId)) {
          const productExists = await tx.product.findUnique({ where: { id: item.productId } });
          if (productExists) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: parseInt(item.qty) }
              }
            })
          }
        }
      }

      return newTx;
    })

    revalidatePath('/tienda');
    revalidatePath('/');
    return { success: true, transaction }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        items: true,
        cashier: { select: { name: true, cedula: true } },
        customer: { select: { name: true, cedula: true, coachId: true } }
      },
      orderBy: { date: 'desc' }
    })
    return { success: true, transactions }
  } catch (error: any) {
    return { success: false, error: error.message, transactions: [] }
  }
}

async function cancelExpiredCashOrders() {
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

export async function getPendingTransactions() {
  await cancelExpiredCashOrders();
  try {
    const transactions = await prisma.transaction.findMany({
      where: { status: 'PENDING_DELIVERY' },
      include: {
        customer: true,
        items: true
      },
      orderBy: { date: 'asc' }
    });
    return { success: true, transactions };
  } catch (error: any) {
    return { success: false, error: error.message, transactions: [] };
  }
}

export async function deliverTransaction(transactionId: string, cashierId: string) {
  try {
    const transaction = await prisma.$transaction(async (tx) => {
      const activeSession = await tx.cashSession.findFirst({
        where: { cashierId: cashierId, status: 'OPEN' }
      });

      if (!activeSession) {
        throw new Error('No tienes un turno de caja abierto para registrar esta entrega.');
      }

      return await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          cashierId: cashierId,
          cashSessionId: activeSession.id
        }
      });
    });

    return { success: true, transaction };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


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
