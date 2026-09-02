"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

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
    const product = await prisma.product.create({
      data: {
        barcode: data.barcode,
        name: data.name,
        price: parseFloat(data.price),
        cost: parseFloat(data.cost),
        stock: parseInt(data.stock),
        category: data.category
      }
    })
    revalidatePath("/tienda")
    return { success: true, product }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        price: parseFloat(data.price),
        cost: parseFloat(data.cost),
        stock: parseInt(data.stock),
        category: data.category
      }
    })
    revalidatePath("/tienda")
    return { success: true, product }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath("/tienda")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createTransaction(data: any) {
  try {
    // Start a transaction to ensure all or nothing
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Create the main transaction
      const newTx = await tx.transaction.create({
        data: {
          cashierId: data.cashierId,
          customerId: data.customerId || null,
          subtotal: parseFloat(data.subtotal),
          tax: parseFloat(data.tax),
          total: parseFloat(data.total),
          paymentMethod: data.paymentMethod,
          reference: data.reference || null,
          status: 'COMPLETED',
          items: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              name: item.name,
              price: parseFloat(item.price),
              qty: parseInt(item.qty),
              subtotal: parseFloat(item.subtotal)
            }))
          }
        }
      });

      // 2. Decrement stock for real products
      for (const item of data.items) {
        if (!['MEMB', 'COACH'].includes(item.productId)) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: parseInt(item.qty) }
            }
          })
        }
      }

      return newTx;
    })

    revalidatePath("/tienda")
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
