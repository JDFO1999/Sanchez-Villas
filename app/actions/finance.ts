"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addExpense(data: { description: string, amount: number, category: string }) {
  try {
    const expense = await prisma.expense.create({
      data: {
        description: data.description,
        amount: parseFloat(data.amount.toString()),
        category: data.category
      }
    })
    revalidatePath("/finanzas")
    return { success: true, expense }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getExpenses() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' }
    })
    return { success: true, expenses }
  } catch (error: any) {
    return { success: false, error: error.message, expenses: [] }
  }
}
