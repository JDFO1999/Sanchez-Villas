import { PrismaClient } from '@prisma/client'

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  if (!url.includes('sslaccept') && !url.includes('sslmode')) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}sslaccept=accept_invalid_certs`
  }
  return url
}

let schemaEnsured = false
let schemaEnsuringPromise: Promise<void> | null = null

async function runSchemaSelfHeal(client: PrismaClient): Promise<void> {
  if (schemaEnsured) return
  if (schemaEnsuringPromise) return schemaEnsuringPromise

  schemaEnsuringPromise = (async () => {
    try {
      // Auto-reparación de columnas añadidas recientemente en User (evita error P2022 si prisma db push no corrió en Coolify)
      try {
        await client.$executeRawUnsafe(
          `ALTER TABLE \`User\` ADD COLUMN \`bankName\` VARCHAR(191) NULL`
        )
      } catch {
        // Columna ya existe (MySQL 1060) o tabla aún no creada
      }

      try {
        await client.$executeRawUnsafe(
          `ALTER TABLE \`User\` ADD COLUMN \`mobilePaymentBank\` VARCHAR(191) NULL`
        )
      } catch {
        // Columna ya existe (MySQL 1060) o tabla aún no creada
      }

      try {
        await client.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS \`PasswordResetToken\` (
            \`id\` VARCHAR(191) NOT NULL,
            \`token\` VARCHAR(191) NOT NULL,
            \`userId\` VARCHAR(191) NOT NULL,
            \`expiresAt\` DATETIME(3) NOT NULL,
            \`used\` BOOLEAN NOT NULL DEFAULT false,
            \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`PasswordResetToken_token_key\` (\`token\`),
            KEY \`PasswordResetToken_userId_idx\` (\`userId\`)
          ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `)
      } catch {
        // Tabla ya existe
      }

      schemaEnsured = true
    } catch (err) {
      console.warn('[db] Aviso en auto-verificación de esquema:', err)
    } finally {
      schemaEnsuringPromise = null
    }
  })()

  return schemaEnsuringPromise
}

const prismaClientSingleton = (): PrismaClient => {
  const url = getDatabaseUrl()
  const baseClient = new PrismaClient(url ? { datasources: { db: { url } } } : undefined)

  if (typeof (baseClient as any).$extends === 'function') {
    return baseClient.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }: any) {
            if (!schemaEnsured) {
              await runSchemaSelfHeal(baseClient)
            }
            try {
              return await query(args)
            } catch (err: any) {
              // Si ocurre P2022 (columna inexistente), forzar auto-reparación y reintentar una vez
              if (err?.code === 'P2022') {
                schemaEnsured = false
                await runSchemaSelfHeal(baseClient)
                return await query(args)
              }
              throw err
            }
          }
        }
      }
    }) as unknown as PrismaClient
  }

  return baseClient
}

declare global {
  var prismaGlobal: undefined | PrismaClient
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export async function ensureDatabaseSchema() {
  await runSchemaSelfHeal(prisma)
}

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
