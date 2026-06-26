import { prisma } from "@/lib/prisma"

/**
 * Checks if the database has the required tables.
 * Prisma connects at the PostgreSQL protocol level — the connection
 * handshake only validates credentials and server reachability, not
 * the existence of any specific tables. Tables must be created via
 * `prisma db push` or `prisma migrate dev` before queries will work.
 *
 * This utility provides graceful fallbacks when tables are missing.
 */
export async function ensureTablesExist(): Promise<{
  ok: boolean
  missing: string[]
}> {
  const requiredTables = ["User", "Workspace", "Conversation"] as const
  const missing: string[] = []

  for (const table of requiredTables) {
    try {
      await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) FROM "${table}" LIMIT 1`
      )
    } catch {
      missing.push(table)
    }
  }

  return {
    ok: missing.length === 0,
    missing,
  }
}

/**
 * Wraps a Prisma query to gracefully handle missing tables.
 * Returns a default value if the table doesn't exist yet.
 */
export async function safeQuery<T>(
  query: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await query()
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : String(error)
    // Prisma error codes for missing table: P2021
    if (msg.includes("P2021") || msg.includes("does not exist")) {
      return fallback
    }
    throw error
  }
}