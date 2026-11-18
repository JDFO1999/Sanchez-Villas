"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { guard, ROLES } from "@/lib/authz"
import { audit } from "@/lib/audit"

export async function addExpense(data: { description: string, amount: number, category: string }) {
  // guard:addExpense
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const expense = await prisma.expense.create({
      data: {
        description: data.description,
        amount: parseFloat(data.amount.toString()),
        category: data.category
      }
    })
    await audit("expense.create", g.user, { id: expense.id, amount: expense.amount, category: expense.category, description: expense.description })
    revalidatePath("/finanzas")
    return { success: true, expense }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateExpense(id: string, data: { description: string, amount: number, category: string }) {
  // guard:updateExpense
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        description: data.description,
        amount: parseFloat(data.amount.toString()),
        category: data.category
      }
    })
    await audit("expense.update", g.user, { id: expense.id, amount: expense.amount, category: expense.category, description: expense.description })
    revalidatePath("/finanzas")
    return { success: true, expense }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteExpense(id: string) {
  // guard:deleteExpense
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error }
  try {
    const existing = await prisma.expense.findUnique({ where: { id } })
    await prisma.expense.delete({
      where: { id }
    })
    await audit("expense.delete", g.user, { id, description: existing?.description, amount: existing?.amount })
    revalidatePath("/finanzas")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getExpenses() {
  // guard:getExpenses
  const g = await guard(ROLES.ADMIN)
  if (!g.ok) return { success: false, error: g.error, expenses: [] }
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    })
    return { success: true, expenses }
  } catch (error: any) {
    return { success: false, error: error.message, expenses: [] }
  }
}
