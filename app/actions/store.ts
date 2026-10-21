"use server";
import { verifySession } from "@/lib/session";
import prisma from "@/lib/db"
import { sendReceiptEmail } from "@/lib/mailer"
import { revalidatePath } from "next/cache"
import { saveBase64Image } from "@/lib/image-utils"
import { guard, ROLES } from "@/lib/authz"
import { audit } from "@/lib/audit"

export async function getProducts() {
  // guard:getProducts
  const g = await guard()
  if (!g.ok) return { success: false, error: g.error, products: [] }
  try {
    const dbProducts = await prisma.product.findMany()
    const products = dbProducts.map(p => ({
      ...p,
      sellPrice: p.price,
      buyPrice: p.cost,
      costPrice: p.cost,
      currentStock: p.stock,
      department: p.category,
      minStockAlert: 5
    }))
    return { success: true, products }
  } catch (error: any) {
    return { success: false, error: error.message, products: [] }
  }
}

export async function createProduct(data: any) {
  // guard:createProduct
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
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
  // guard:updateProduct
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
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
  // guard:deleteProduct
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
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
  const g = await guard()
  if (!g.ok) return { success: false, error: g.error }
  const isPosUser = (ROLES.POS as readonly string[]).includes(g.user.role)
  const isAthlete = g.user.role === 'athlete'
  if (!isPosUser && !isAthlete) return { success: false, error: 'No autorizado' }

  try {
    if (!Array.isArray(data?.items) || data.items.length === 0 || data.items.length > 100) {
      return { success: false, error: 'El carrito está vacío o es demasiado grande.' }
    }
    const method = String(data.paymentMethod || '')
    if (!method) return { success: false, error: 'Falta el método de pago.' }
    // Crédito/Fiado solo lo registra el personal de caja a un cliente y SIEMPRE con autorización de Administrador
    const isCredit = /fiado|cr[eé]dito/i.test(method)
    if (isCredit && (isAthlete || !data.customerId)) {
      return { success: false, error: 'El crédito solo puede registrarlo el personal a un cliente registrado.' }
    }

    if (isCredit) {
      const { validateAdminPasswordAction } = await import('@/app/actions/auth')
      const adminAuth = await validateAdminPasswordAction(String(data.adminCreditPassword || ''))
      if (!adminAuth.success) {
        return {
          success: false,
          error: adminAuth.error || 'Se requiere la contraseña de un Administrador para autorizar el Crédito / Fiado.'
        }
      }
    }

    const receiptImage = await saveBase64Image(data.receiptImage, 'receipt');

    // Identidad: el cajero y el cliente salen de la sesión, no del navegador
    const cashierId: string | null = isPosUser ? g.user.id : null
    const customerId: string | null = isAthlete ? g.user.id : (data.customerId || null)

    // Start a transaction to ensure all or nothing
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Precios REALES desde la base de datos (nunca los que envía el navegador)
      const lines: { productId: string; name: string; price: number; qty: number; subtotal: number; physical: boolean }[] = []
      for (const item of data.items) {
        const qty = Number(item?.qty)
        if (!Number.isInteger(qty) || qty < 1 || qty > 1000) throw new Error('Cantidad no válida.')
        const productId = String(item?.productId ?? '')
        const product = await tx.product.findUnique({ where: { id: productId } })

        if (product) {
          // El atleta no puede pedir más de lo que hay; el personal puede forzar (override de stock del admin)
          if (isAthlete && product.stock < qty) throw new Error(`Stock insuficiente de "${product.name}".`)
          lines.push({ productId, name: product.name, price: product.price, qty, subtotal: product.price * qty, physical: true })
        } else if (
          ['MEMB', 'MEMBRESIA-001', 'COACH', 'COACH_FEE', 'DEBT_PAYMENT'].includes(productId) ||
          productId.startsWith('PLAN:')
        ) {
          // Membresías y planes promocionales son ítems virtuales (sin stock físico)
          const price = Number(item?.price)
          if (!Number.isFinite(price) || price <= 0 || price > 1_000_000) throw new Error('Precio no válido.')
          lines.push({ productId, name: String(item?.name ?? productId).slice(0, 120), price, qty, subtotal: price * qty, physical: false })
        } else {
          throw new Error('Uno de los productos ya no está disponible.')
        }
      }

      const subtotal = lines.reduce((acc, l) => acc + l.subtotal, 0)
      const taxIn = Number(data.tax)
      const tax = Number.isFinite(taxIn) && taxIn >= 0 && taxIn <= subtotal ? taxIn : 0
      const expected = subtotal + tax
      // El personal puede aplicar un descuento (total menor); jamás un total mayor ni negativo.
      const totalIn = Number(data.total)
      const total = isPosUser && Number.isFinite(totalIn) && totalIn >= 0 && totalIn <= expected ? totalIn : expected

      // Calcular el monto exacto fiado (completo o parcial en pago Mixto)
      let creditAmount = 0
      if (isCredit) {
        const rawCredit = Number(data.creditAmount)
        if (Number.isFinite(rawCredit) && rawCredit > 0 && rawCredit <= total) {
          creditAmount = rawCredit
        } else if (/^mixto:/i.test(method)) {
          const match = method.match(/cr[eé]dito\s*\/?\s*fiado\s*\([^0-9]*([0-9]+(?:\.[0-9]+)?)\)/i)
          creditAmount = match ? Math.min(total, parseFloat(match[1]) || total) : total
        } else {
          creditAmount = total
        }
      }

      // 0. Encontrar el turno de caja abierto del cajero (si hay cajero)
      let activeSession = null;
      if (cashierId) {
        activeSession = await tx.cashSession.findFirst({
          where: { cashierId, status: 'OPEN' }
        });
      }

      // 2. Create the main transaction
      const newTx = await tx.transaction.create({
        data: {
          cashierId,
          cashSessionId: activeSession ? activeSession.id : null,
          customerId,
          subtotal,
          tax,
          total,
          paymentMethod: method,
          reference: data.reference ? String(data.reference).slice(0, 190) : null,
          receiptImage: receiptImage || null,
          status: cashierId ? 'COMPLETED' : 'PENDING_DELIVERY',
          items: {
            create: lines.map(l => ({
              productId: l.productId,
              name: l.name,
              price: l.price,
              qty: l.qty,
              subtotal: l.subtotal
            }))
          }
        },
        include: {
          items: true
        }
      });

      // 3. Decrement stock for real products
      for (const l of lines) {
        if (l.physical) {
          await tx.product.update({
            where: { id: l.productId },
            data: { stock: { decrement: l.qty } }
          })
        }
      }

      // 3b. Activación unificada y atómica de Membresía/Plan al facturar en Recepción/Caja (/tienda o /membresias).
      // Garantiza que NINGUNA membresía se active sin su respectiva transacción financiera en /finanzas.
      if (cashierId && customerId) {
        for (const l of lines) {
          if (l.productId === 'MEMB' || l.productId === 'MEMBRESIA-001' || l.productId.startsWith('PLAN:')) {
            const latestMemb = await tx.membership.findFirst({
              where: { athleteId: customerId },
              orderBy: { endDate: 'desc' }
            });
            const now = new Date();
            const currentEnd = latestMemb?.endDate ? new Date(latestMemb.endDate) : new Date(0);
            const startFrom = currentEnd > now ? new Date(currentEnd) : new Date(now);
            const monthsToAdd = Math.max(1, Number(l.qty) || 1);
            startFrom.setMonth(startFrom.getMonth() + monthsToAdd);
            const planName = l.productId.startsWith('PLAN:')
              ? (l.productId.slice(5).trim() || 'Mensual')
              : (l.name.replace(/^Mensualidad\s*[-–:]?\s*/i, '').replace(/\s*\(\d+\s*mes.*?\)\s*$/i, '').trim() || 'Mensual');

            await tx.membership.create({
              data: {
                athleteId: customerId,
                status: 'ACTIVE',
                planName,
                startDate: now,
                endDate: startFrom
              }
            });
          }
        }
      }

      // 4. Update debt if FIADO (incrementa storeDebt por el monto exacto autorizado como Crédito/Fiado)
      if (isCredit && customerId && creditAmount > 0) {
        await tx.user.update({
          where: { id: customerId },
          data: {
            storeDebt: { increment: creditAmount }
          }
        })
      }

      return newTx;
    })

    revalidatePath('/tienda');
    revalidatePath('/membresias');
    revalidatePath('/atletas');
    revalidatePath('/finanzas');
    revalidatePath('/');
    await audit("sale.create", g.user, { transactionId: transaction.id, total: transaction.total, method, reference: transaction.reference });
    return { success: true, transaction }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getTransactions() {
  // guard:getTransactions
  const g = await guard(ROLES.POS)
  if (!g.ok) return { success: false, error: g.error, transactions: [] }
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        items: true,
        cashier: { select: { name: true, cedula: true } },
        customer: { select: { name: true, cedula: true, coachId: true, profilePicture: true } }
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
      if (!['MEMB', 'MEMBRESIA-001', 'COACH', 'COACH_FEE'].includes(item.productId) && !item.productId.startsWith('PLAN:')) {
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
  // guard:getPendingTransactions
  const g = await guard(ROLES.POS)
  if (!g.ok) return { success: false, error: g.error, transactions: [] }
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

export async function deliverTransaction(transactionId: string, cashierId: string, changeNote?: string) {
  // guard:deliverTransaction
  const g = await guard(ROLES.POS)
  if (!g.ok) return { success: false, error: g.error }
  cashierId = g.user.id
  try {
    const transaction = await prisma.$transaction(async (tx) => {
      let activeSession = await tx.cashSession.findFirst({
        where: { cashierId: cashierId, status: 'OPEN' }
      });

      if (!activeSession) {
        activeSession = await tx.cashSession.findFirst({
          where: { status: 'OPEN' }
        });
      }

      if (!activeSession && g.user.role !== 'admin' && g.user.role !== 'gerente') {
        throw new Error('No tienes un turno de caja abierto para registrar esta entrega.');
      }

      const existingTx = await tx.transaction.findUnique({ where: { id: transactionId } });
      const combinedRef = changeNote
        ? [existingTx?.reference, changeNote].filter(Boolean).join(' | ').slice(0, 190)
        : existingTx?.reference;

      const updatedTx = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          cashierId: cashierId,
          cashSessionId: activeSession ? activeSession.id : null,
          ...(changeNote ? { reference: combinedRef } : {})
        },
        include: { items: true }
      });

      // Hook for Membership / Promotional Plan online payments
      if (updatedTx.customerId) {
        for (const item of updatedTx.items) {
          if (
            item.productId === 'MEMB' ||
            item.productId === 'MEMBRESIA-001' ||
            item.productId.startsWith('PLAN:')
          ) {
            const latestMemb = await tx.membership.findFirst({
              where: { athleteId: updatedTx.customerId },
              orderBy: { endDate: 'desc' }
            });
            const now = new Date();
            const currentEnd = latestMemb?.endDate ? new Date(latestMemb.endDate) : new Date(0);
            const startFrom = currentEnd > now ? new Date(currentEnd) : new Date(now);
            const monthsToAdd = Math.max(1, Number(item.qty) || 1);
            startFrom.setMonth(startFrom.getMonth() + monthsToAdd);

            const planName = item.productId.startsWith('PLAN:')
              ? (item.productId.slice(5).trim() || 'Mensual')
              : (item.name.replace(/^Mensualidad\s*[-–:]?\s*/i, '').replace(/\s*\(\d+\s*mes.*?\)\s*$/i, '').trim() || 'Mensual');

            await tx.membership.create({
              data: {
                athleteId: updatedTx.customerId,
                status: 'ACTIVE',
                planName,
                startDate: now,
                endDate: startFrom
              }
            });
          }
        }
      }

      // Hook for Coach Change Fee
      const hasCoachFee = updatedTx.items.some((i: any) => i.productId === 'COACH_FEE');
      if (hasCoachFee && updatedTx.customerId) {
        const req = await tx.coachRequest.findFirst({
          where: { athleteId: updatedTx.customerId, status: 'PENDING_PAYMENT' },
          orderBy: { createdAt: 'desc' }
        });
        if (req) {
          const athlete = await tx.user.findUnique({ where: { id: updatedTx.customerId } });
          await tx.user.update({
            where: { id: updatedTx.customerId },
            data: { previousCoachId: athlete?.coachId, coachId: req.newCoachId }
          });
          await tx.coachRequest.update({
            where: { id: req.id },
            data: { status: 'COMPLETED' }
          });
        }
      }
      return updatedTx;
    });

    revalidatePath('/tienda');
    revalidatePath('/membresias');
    revalidatePath('/atletas');
    revalidatePath('/finanzas');
    revalidatePath('/');
    return { success: true, transaction };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function cancelTransaction(transactionId: string) {
  // guard:cancelTransaction
  const g = await guard()
  if (!g.ok) return { success: false, error: g.error }
  try {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { items: true }
    });

    if (!tx) return { success: false, error: 'Transacción no encontrada' };
    const isPosUser = (ROLES.POS as readonly string[]).includes(g.user.role)
    if (!isPosUser && tx.customerId !== g.user.id) return { success: false, error: 'No autorizado' };
    if (tx.status !== 'PENDING_DELIVERY') return { success: false, error: 'La transacción no está pendiente' };
    if (!isPosUser && tx.paymentMethod !== 'Efectivo') return { success: false, error: 'Solo se pueden cancelar facturas en Efectivo' };

    await prisma.$transaction(async (txPrisma) => {
      await txPrisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'CANCELED' }
      });

      for (const item of tx.items) {
        if (!['MEMB', 'MEMBRESIA-001', 'COACH', 'COACH_FEE'].includes(item.productId) && !item.productId.startsWith('PLAN:')) {
          const prod = await txPrisma.product.findUnique({ where: { id: item.productId } });
          if (prod) {
            await txPrisma.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.qty } }
            });
          }
        }
      }
    });

    await audit("sale.cancel", g.user, { transactionId });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function adminRefundTransaction(transactionId: string) {
  // guard:adminRefundTransaction
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { items: true }
    });

    if (!tx) return { success: false, error: 'Transacción no encontrada' };
    if (tx.status === 'CANCELED') return { success: false, error: 'La transacción ya está anulada' };

    await prisma.$transaction(async (txPrisma) => {
      // 1. Mark as CANCELED
      await txPrisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'CANCELED' }
      });

      // 2. Return stock for physical items
      for (const item of tx.items) {
        if (!['MEMB', 'MEMBRESIA-001', 'COACH', 'COACH_FEE'].includes(item.productId) && !item.productId.startsWith('PLAN:')) {
          const productExists = await txPrisma.product.findUnique({ where: { id: item.productId } });
          if (productExists) {
            await txPrisma.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.qty } }
            });
          }
        }
      }

      // 3. Deduct from FIADO debt if applicable
      const pm = String(tx.paymentMethod || '')
      if (/fiado|cr[eé]dito/i.test(pm) && tx.customerId) {
        let creditToDeduct = tx.total
        if (/^mixto:/i.test(pm)) {
          const match = pm.match(/cr[eé]dito\s*\/?\s*fiado\s*\([^0-9]*([0-9]+(?:\.[0-9]+)?)\)/i)
          if (match) creditToDeduct = parseFloat(match[1]) || tx.total
        }
        const customer = await txPrisma.user.findUnique({ where: { id: tx.customerId } })
        if (customer) {
          const nextDebt = Math.max(0, (customer.storeDebt || 0) - creditToDeduct)
          await txPrisma.user.update({
            where: { id: tx.customerId },
            data: { storeDebt: nextDebt }
          })
        }
      }
    });

    await audit("sale.refund", g.user, { transactionId });
    revalidatePath('/finanzas');
    revalidatePath('/membresias');
    revalidatePath('/tienda');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function settleAthleteDebt(data: {
  athleteId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
}) {
  const g = await guard(ROLES.POS)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const amount = Number(data?.amount)
    if (!data?.athleteId || !Number.isFinite(amount) || amount <= 0) {
      return { success: false, error: 'Monto o cliente no válido.' }
    }
    const method = String(data?.paymentMethod || 'Efectivo').trim()
    if (/fiado|cr[eé]dito/i.test(method)) {
      return { success: false, error: 'No puedes saldar una deuda con otro Crédito/Fiado.' }
    }

    const result = await prisma.$transaction(async (tx) => {
      const athlete = await tx.user.findUnique({
        where: { id: data.athleteId },
        include: { memberships: { orderBy: { endDate: 'desc' }, take: 1 } }
      })
      if (!athlete) throw new Error('Atleta no encontrado.')
      const currentDebt = Number(athlete.storeDebt || 0)
      if (currentDebt <= 0) throw new Error('El atleta no posee cuentas por cobrar pendientes.')

      const payAmount = Math.min(currentDebt, Math.round(amount * 100) / 100)
      const nextDebt = Math.max(0, Math.round((currentDebt - payAmount) * 100) / 100)
      const activeSession = await tx.cashSession.findFirst({
        where: { cashierId: g.user.id, status: 'OPEN' }
      })

      const planLabel = athlete.memberships?.[0]?.planName ? ` (${athlete.memberships[0].planName})` : ''
      const paymentTx = await tx.transaction.create({
        data: {
          cashierId: g.user.id,
          cashSessionId: activeSession ? activeSession.id : null,
          customerId: athlete.id,
          subtotal: payAmount,
          tax: 0,
          total: payAmount,
          paymentMethod: method,
          reference: data.reference ? String(data.reference).slice(0, 190) : 'Pago de Cuenta por Cobrar',
          status: 'COMPLETED',
          items: {
            create: [
              {
                productId: 'DEBT_PAYMENT',
                name: `Pago de Cuenta por Cobrar / Fiado${planLabel}`.slice(0, 120),
                price: payAmount,
                qty: 1,
                subtotal: payAmount
              }
            ]
          }
        },
        include: { items: true }
      })

      await tx.user.update({
        where: { id: athlete.id },
        data: { storeDebt: nextDebt }
      })

      return { paymentTx, nextDebt }
    })

    await audit("sale.create", g.user, {
      transactionId: result.paymentTx.id,
      total: result.paymentTx.total,
      method,
      note: "settle_debt"
    })
    revalidatePath('/finanzas')
    revalidatePath('/membresias')
    revalidatePath('/atletas')
    revalidatePath('/tienda')
    revalidatePath('/')
    return { success: true, transaction: result.paymentTx, remainingDebt: result.nextDebt }
  } catch (error: any) {
    return { success: false, error: error.message || 'No se pudo registrar el pago de la deuda.' }
  }
}

