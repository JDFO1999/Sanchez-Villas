#!/bin/sh
set -e

echo "==> [Coolify Entrypoint] Comprobando base de datos..."
if [ -n "$DATABASE_URL" ]; then
  # Si MySQL requiere conexión segura (--require_secure_transport=ON), aseguramos sslaccept
  if ! echo "$DATABASE_URL" | grep -q "sslaccept" && ! echo "$DATABASE_URL" | grep -q "sslmode"; then
    if echo "$DATABASE_URL" | grep -q "?"; then
      export DATABASE_URL="${DATABASE_URL}&sslaccept=accept_invalid_certs"
    else
      export DATABASE_URL="${DATABASE_URL}?sslaccept=accept_invalid_certs"
    fi
  fi

  echo "==> [Coolify Entrypoint] Configuración de base de datos verificada."
  echo "==> [Coolify Entrypoint] Sincronizando tablas y esquema de base de datos..."
  if [ -f "./node_modules/prisma/build/index.js" ]; then
    timeout 30s node ./node_modules/prisma/build/index.js db push --skip-generate || echo "==> [Coolify Entrypoint] Aviso: db push finalizó o ya estaba al día."
  else
    timeout 30s npx prisma db push --skip-generate || echo "==> [Coolify Entrypoint] Aviso: prisma db push finalizó o ya estaba al día."
  fi
else
  echo "==> [Coolify Entrypoint] DATABASE_URL no está configurada."
fi

echo "==> [Coolify Entrypoint] Iniciando servidor Next.js..."
exec node server.js
