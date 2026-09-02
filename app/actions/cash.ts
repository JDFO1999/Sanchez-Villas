"use server"

import prisma from "@/lib/db"

export async function openCashSession(cashierId: string, startingCash: number) {
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
    return { success: true, session }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCurrentCashSession(cashierId: string) {
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
  try {
    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
      include: { transactions: true }
    })

    if (!session || session.status === 'CLOSED') {
      return { success: false, error: 'El turno no existe o ya está cerrado.' }
    }

    // Calcular montos esperados
    let expectedEfectivo = session.startingCash
    let expectedTarjeta = 0
    let expectedTransferencia = 0

    for (const tx of session.transactions) {
      if (tx.status === 'COMPLETED') {
        const method = tx.paymentMethod.toLowerCase()
        if (method === 'efectivo') expectedEfectivo += tx.total
        else if (method === 'tarjeta' || method === 'punto de venta') expectedTarjeta += tx.total
        else expectedTransferencia += tx.total
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

    return { success: true, session: closedSession }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
