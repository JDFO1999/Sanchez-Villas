"use server"

import prisma from "@/lib/db"
import { guard, ROLES } from "@/lib/authz"
import { audit } from "@/lib/audit"

export async function openCashSession(cashierId: string, startingCash: number) {
  // guard:openCashSession
  const g = await guard(ROLES.POS)
  if (!g.ok) return { success: false, error: g.error }
  cashierId = g.user.id
  if (!Number.isFinite(startingCash) || startingCash < 0) return { success: false, error: 'Monto inicial no válido.' }
  try {
    // Verificar si ya tiene una sesión abierta
    const openSession = await prisma.cashSession.findFirst({
      where: { cashierId, status: 'OPEN' }
    })
    
    if (openSession) {
      return { success: false, error: 'Ya tienes un turno de caja abierto.' }
    }

    const session = await prisma.cashSession.create({
      data: {
        cashierId,
        startingCash: startingCash,
        status: 'OPEN'
      }
    })
    await audit("cash.open", g.user, { startingCash });
    return { success: true, session }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCurrentCashSession(cashierId: string) {
  // guard:getCurrentCashSession
  const g = await guard(ROLES.POS)
  if (!g.ok) return { success: false, error: g.error }
  if (g.user.role !== 'admin') cashierId = g.user.id
  try {
    const session = await prisma.cashSession.findFirst({
      where: { cashierId, status: 'OPEN' },
      include: { transactions: true }
    })
    return { success: true, session }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function closeCashSession(sessionId: string, declaredCash: number) {
  // guard:closeCashSession
  const g = await guard(ROLES.POS)
  if (!g.ok) return { success: false, error: g.error }
  if (!Number.isFinite(declaredCash) || declaredCash < 0) return { success: false, error: 'Monto declarado no válido.' }
  try {
    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
      include: { transactions: true }
    })

    // owner-check
    if (session && g.user.role !== 'admin' && session.cashierId !== g.user.id) {
      return { success: false, error: 'No autorizado' }
    }

    if (!session || session.status === 'CLOSED') {
      return { success: false, error: 'El turno no existe o ya está cerrado.' }
    }

    // Calcular montos esperados
    let expectedEfectivo = session.startingCash
    let expectedTarjeta = 0
    let expectedTransferencia = 0

    for (const tx of session.transactions) {
      if (tx.status === 'COMPLETED') {
        const method = (tx.paymentMethod || '').toLowerCase()
        const ref = String(tx.reference || '')
        if (method.startsWith('mixto')) {
          // Parse format: "Mixto: Efectivo ($10.00) + Pago Móvil ($15.00)"
          const parts = tx.paymentMethod.replace(/^mixto:\s*/i, '').split(/\s*\+\s*/)
          for (const part of parts) {
            const match = part.match(/^(.*?)\s*\([^0-9]*([\d.]+)\)/i)
            if (match) {
              const subMethod = match[1].trim().toLowerCase()
              const subAmount = parseFloat(match[2]) || 0
              if (subMethod.includes('efectivo')) expectedEfectivo += subAmount
              else if (subMethod.includes('tarjeta') || subMethod.includes('punto')) expectedTarjeta += subAmount
              else expectedTransferencia += subAmount
            } else {
              expectedTransferencia += tx.total
            }
          }
        } else {
          if (method === 'efectivo') expectedEfectivo += tx.total
          else if (method === 'tarjeta' || method === 'punto de venta') expectedTarjeta += tx.total
          else expectedTransferencia += tx.total
        }

        // Ajuste contable de Vuelto:
        // Si el cliente pagó en Efectivo (ej. billete de $20 por un plan de $15) pero el vuelto ($5) se entregó por Pago Móvil/Transferencia,
        // en la gaveta física de efectivo quedaron los $20 completos (+$5 en efectivo físico) y salieron -$5 de banco.
        // Si el cliente pagó por vía digital y el vuelto se entregó en Efectivo de caja, salieron -$5 de la gaveta física.
        const vueltoMatch = ref.match(/Vuelto:\s*[^0-9]*([\d.]+)\s*\(([^)]+)\)/i)
        if (vueltoMatch) {
          const vueltoAmount = parseFloat(vueltoMatch[1]) || 0
          const vueltoMethod = vueltoMatch[2].toLowerCase()
          if (vueltoAmount > 0) {
            const paidCashOnly = method === 'efectivo'
            const vueltoByDigital = vueltoMethod.includes('móvil') || vueltoMethod.includes('movil') || vueltoMethod.includes('transfer') || vueltoMethod.includes('binance')
            const vueltoByCash = vueltoMethod.includes('efectivo')

            if (paidCashOnly && vueltoByDigital) {
              expectedEfectivo += vueltoAmount
              expectedTransferencia -= vueltoAmount
            } else if (!paidCashOnly && !method.startsWith('mixto') && vueltoByCash) {
              expectedEfectivo -= vueltoAmount
              expectedTransferencia += vueltoAmount
            }
          }
        }
      }
    }

    const closedSession = await prisma.cashSession.update({
      where: { id: sessionId },
      data: {
        endTime: new Date(),
        status: 'CLOSED',
        declaredCash,
        expectedCash: expectedEfectivo,
        expectedCard: expectedTarjeta,
        expectedTransfer: expectedTransferencia
      }
    })

    await audit("cash.close", g.user, { sessionId, declared: declaredCash, expected: expectedEfectivo });
    return { success: true, session: closedSession }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
