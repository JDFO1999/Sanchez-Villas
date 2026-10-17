import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";
import fs from "fs";

function runDbPush() {
  let dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl && !dbUrl.includes("sslaccept") && !dbUrl.includes("sslmode")) {
    const sep = dbUrl.includes("?") ? "&" : "?";
    dbUrl = `${dbUrl}${sep}sslaccept=accept_invalid_certs`;
  }

  let cmd = "";
  if (fs.existsSync("./node_modules/prisma/build/index.js")) {
    cmd = "node ./node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss";
  } else if (fs.existsSync("./node_modules/.bin/prisma")) {
    cmd = "./node_modules/.bin/prisma db push --skip-generate --accept-data-loss";
  } else {
    cmd = "npx prisma db push --skip-generate --accept-data-loss";
  }

  return execSync(cmd, {
    env: { ...process.env, DATABASE_URL: dbUrl },
    timeout: 60000,
    encoding: "utf-8",
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secretKey = url.searchParams.get("key");

  // Llave de seguridad temporal para ejecutar la comprobación
  if (secretKey !== "admin-init-2026") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let pushLog: string | null = null;

  try {
    // 1. Probar conexión y verificar si las tablas existen
    let userCount = 0;
    try {
      userCount = await prisma.user.count();
    } catch (e: any) {
      if (e?.message?.includes("does not exist") || e?.message?.includes("Table")) {
        // La tabla no existe: creamos las tablas automáticamente con db push
        pushLog = runDbPush();
        userCount = await prisma.user.count();
      } else {
        throw e;
      }
    }

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
      tablesCreatedNow: pushLog !== null,
      pushLog: pushLog ? pushLog.split("\n").slice(-5) : undefined,
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
      pushLog,
      stack: error?.stack
    }, { status: 500 });
  }
}

