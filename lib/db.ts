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

const prismaClientSingleton = () => {
  const url = getDatabaseUrl()
  return new PrismaClient(url ? { datasources: { db: { url } } } : undefined)
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

