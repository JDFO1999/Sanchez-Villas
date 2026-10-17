#!/bin/sh
set -e

echo "==> [Coolify Entrypoint] Comprobando base de datos..."
if [ -n "$DATABASE_URL" ]; then
  echo "==> [Coolify Entrypoint] Ejecutando prisma db push..."
  if [ -f "./node_modules/.bin/prisma" ]; then
    ./node_modules/.bin/prisma db push --skip-generate || echo "Advertencia: Error en prisma db push. Continuando inicio..."
  else
    npx --no-install prisma db push --skip-generate || echo "Advertencia: Error en prisma db push. Continuando inicio..."
  fi

  echo "==> [Coolify Entrypoint] Verificando usuario administrador inicial..."
  if [ -f "./scripts/init-admin.js" ]; then
    node ./scripts/init-admin.js || echo "Advertencia: Error en init-admin.js"
  fi
else
  echo "==> [Coolify Entrypoint] DATABASE_URL no está configurada, omitiendo prisma db push."
fi

echo "==> [Coolify Entrypoint] Iniciando servidor Next.js..."
exec node server.js
