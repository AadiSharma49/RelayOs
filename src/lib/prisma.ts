import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  const client = new PrismaClient()
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client
  return client
}

let cachedPrisma: PrismaClient | undefined

/**
 * Lazily-initialized Prisma client.
 *
 * Creating PrismaClient is deferred until the first actual database call.
 * This avoids crashes during Next.js build's "collecting page data" phase
 * when modules are evaluated but the database may not be reachable.
 */
export function getPrisma(): PrismaClient {
  if (!cachedPrisma) {
    cachedPrisma = createPrismaClient()
  }
  return cachedPrisma
}

// Re-export as `prisma` for convenience in route handlers.
// Since getPrisma() is lazy, importing this file at module level is safe.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as any)[prop]
  },
})
