#!/bin/sh
set -e

echo "==> [Coolify Entrypoint] Comprobando base de datos..."
if [ -n "$DATABASE_URL" ]; then
  echo "==> [Coolify Entrypoint] Ejecutando prisma db push..."
  # db push sincroniza automáticamente el esquema de Prisma con la base de datos sin requerir migraciones manuales
  npx prisma db push --skip-generate || echo "Advertencia: No se pudo conectar a la base de datos de inmediato. Iniciando servidor..."
else
  echo "==> [Coolify Entrypoint] DATABASE_URL no está configurada, omitiendo prisma db push."
fi

echo "==> [Coolify Entrypoint] Iniciando servidor Next.js..."
exec node server.js
