// Convierte a bcrypt las contraseñas que aún están en texto plano. Es idempotente: las que ya son bcrypt no se tocan.
// La contraseña de cada usuario NO cambia (sigue entrando con la misma); solo se guarda cifrada.
//
// Uso:   node scripts/migrate-passwords.mjs            (usa DATABASE_URL del .env)
// Ejecutar también contra producción antes de quitar la migración "legacy" de loginAction.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const isBcrypt = (s) => /^\$2[aby]\$\d{2}\$/.test(s || "");

try {
  const users = await prisma.user.findMany({ select: { id: true, password: true } });
  const pending = users.filter((u) => !isBcrypt(u.password));
  console.log(`Usuarios: ${users.length} | en texto plano: ${pending.length}`);

  for (const u of pending) {
    if (!u.password) continue; // sin contraseña: no hay nada que cifrar
    await prisma.user.update({ where: { id: u.id }, data: { password: await bcrypt.hash(u.password, 10) } });
  }

  const after = (await prisma.user.findMany({ select: { password: true } })).filter((u) => !isBcrypt(u.password)).length;
  console.log(`Migradas: ${pending.length} | quedan sin cifrar: ${after}`);
} finally {
  await prisma.$disconnect();
}
