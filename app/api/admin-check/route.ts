import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { SCHEMA_STATEMENTS } from "@/lib/schema-sql";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secretKey = url.searchParams.get("key");

  // Llave de seguridad temporal para ejecutar la comprobación
  if (secretKey !== "admin-init-2026") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let tablesCreated = false;
  let executedCount = 0;

  try {
    // 1. Probar si la tabla User existe
    try {
      await prisma.user.count();
    } catch (e: any) {
      if (e?.message?.includes("does not exist") || e?.message?.includes("Table") || e?.code === "P2021") {
        // Ejecutar las sentencias DDL directamente con prisma.$executeRawUnsafe
        for (const statement of SCHEMA_STATEMENTS) {
          try {
            await prisma.$executeRawUnsafe(statement);
            executedCount++;
          } catch (err: any) {
            // Si ya existía alguna tabla/índice/fk, continuamos con las siguientes
            console.warn("SQL Statement notice:", err?.message || err);
          }
        }
        tablesCreated = true;
      } else {
        throw e;
      }
    }

    const userCount = await prisma.user.count();
    const existingUsers = await prisma.user.findMany({
      select: {
        id: true,
        cedula: true,
        name: true,
        role: true,
      }
    });

    // 2. Forzar creación/actualización del Administrador 26710825
    const hashedPassword = await bcrypt.hash("#AdminMaximumSa#93", 10);
    const adminUser = await prisma.user.upsert({
      where: { cedula: "26710825" },
      update: {
        role: "admin",
        password: hashedPassword,
      },
      create: {
        cedula: "26710825",
        name: "Super Administrador",
        role: "admin",
        password: hashedPassword,
      }
    });

    return NextResponse.json({
      success: true,
      message: "¡Base de datos sincronizada y Usuario 26710825 configurado con éxito!",
      tablesCreatedNow: tablesCreated,
      executedStatements: executedCount,
      totalUsersInDB: userCount,
      existingUsersList: existingUsers,
      adminConfigured: {
        id: adminUser.id,
        cedula: adminUser.cedula,
        role: adminUser.role,
        name: adminUser.name,
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || "Error al conectar con la base de datos",
      stack: error?.stack
    }, { status: 500 });
  }
}
