import { prisma } from "./prisma"

export type DbHealthStatus = {
  healthy: boolean
  message: string
  latencyMs: number | null
  lastChecked: string
}

let lastStatus: DbHealthStatus = {
  healthy: false,
  message: "Not checked",
  latencyMs: null,
  lastChecked: new Date().toISOString(),
}

let lastCheckTime = 0
const CACHE_TTL_MS = 10_000 // Cache health result for 10 seconds

/**
 * Check database connection health.
 * Results are cached for 10 seconds to avoid hammering the database.
 * Never exposes connection strings or secrets in the returned message.
 */
export async function checkDatabaseConnection(): Promise<DbHealthStatus> {
  const now = Date.now()
  if (now - lastCheckTime < CACHE_TTL_MS && lastCheckTime > 0) {
    return lastStatus
  }

  const start = performance.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    const latency = Math.round(performance.now() - start)
    lastStatus = {
      healthy: true,
      message: `Connected to PostgreSQL (${latency}ms)`,
      latencyMs: latency,
      lastChecked: new Date().toISOString(),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error"
    // Strip any potential secrets from the error message
    const sanitized = message.replace(
      /(password|secret|token|key)["=: ]+[^\s"'&]+/gi,
      "$1=***"
    )
    lastStatus = {
      healthy: false,
      message: `Database unavailable: ${sanitized.slice(0, 200)}`,
      latencyMs: null,
      lastChecked: new Date().toISOString(),
    }
  }

  lastCheckTime = now
  return lastStatus
}