import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secretKey = url.searchParams.get("key");

  // Llave de seguridad temporal para ejecutar la comprobación
  if (secretKey !== "admin-init-2026") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // 1. Probar conexión a la base de datos
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
      message: "Usuario 26710825 verificado y configurado con éxito como admin",
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
