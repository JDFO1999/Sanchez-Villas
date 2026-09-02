"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

// Obtiene todos los recibos de un empleado
export async function getEmployeePayrollReceipts(employeeId: string) {
  try {
    const receipts = await prisma.payrollReceipt.findMany({
      where: { employeeId },
      orderBy: { date: 'desc' }
    });
    return { success: true, receipts }
  } catch (error: any) {
    return { success: false, error: error.message, receipts: [] }
  }
}

// Calcula las comisiones basadas en pagos reales
export async function calculateCurrentCommissions(employeeId: string, startDate: Date, endDate: Date) {
  try {
    const employee = await prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee) return { success: false, error: "Empleado no encontrado", amount: 0 };

    // Buscar transacciones pagadas por atletas de este coach
    // Nota: Las transacciones tienen items. Filtraremos por productId = 'MEMB' o 'COACH'
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        date: {
          gte: startDate,
          lte: endDate,
        },
        customer: {
          coachId: employeeId
        }
      },
      include: { items: true, customer: true }
    });

    let totalCommission = 0;
    
    // Si los precios son personalizados por el entrenador (gym global setting suele definirlo, pero lo inferimos)
    // Para hacerlo simple y escalable, sumaremos las transacciones de "COACH"
    for (const tx of transactions) {
      for (const item of tx.items) {
        if (item.productId === 'MEMB' || item.productId === 'COACH') {
           if (employee.commissionType === 'percentage') {
             totalCommission += item.subtotal * ((employee.commissionRate || 0) / 100);
           } else {
             totalCommission += (employee.commissionRate || 0); // Flat por pago
           }
        }
      }
    }

    return { success: true, amount: totalCommission }
  } catch (error: any) {
    return { success: false, error: error.message, amount: 0 }
  }
}

// Procesa el pago y guarda el recibo y el gasto en BD
export async function processPayroll(data: {
  employeeId: string,
  periodStart: string,
  periodEnd: string,
  baseSalary: number,
  commission: number,
  bonus: number,
  deductions: number,
  advances: number,
  totalPaid: number,
  notes?: string
}) {
  try {
    const receipt = await prisma.$transaction(async (tx) => {
      // 1. Crear el recibo
      const rec = await tx.payrollReceipt.create({
        data: {
          employeeId: data.employeeId,
          periodStart: new Date(data.periodStart),
          periodEnd: new Date(data.periodEnd),
          baseSalary: data.baseSalary,
          commission: data.commission,
          bonus: data.bonus,
          deductions: data.deductions,
          advances: data.advances,
          totalPaid: data.totalPaid,
          notes: data.notes
        }
      });

      // 2. Crear el Expense en finanzas
      const emp = await tx.user.findUnique({ where: { id: data.employeeId } });
      await tx.expense.create({
         data: {
           description: `Nómina: ${emp?.name} (Período: ${data.periodStart.split('T')[0]})`,
           amount: data.totalPaid,
           category: 'Nómina'
         }
      });

      // 3. Actualizar la última fecha de pago del empleado
      await tx.user.update({
        where: { id: data.employeeId },
        data: { lastPaidDate: new Date() }
      });

      return rec;
    });

    revalidatePath("/finanzas");
    return { success: true, receipt }
  } catch (error: any) {
    console.error("Error processPayroll:", error)
    return { success: false, error: error.message }
  }
}
