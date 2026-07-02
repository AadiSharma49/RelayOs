import { createHash, randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"

/**
 * API-key auth + CORS helpers for endpoints called by the browser extension.
 *
 * The extension runs on a chrome-extension:// origin and has no Clerk session
 * cookie, so it authenticates with a personal API key sent as a Bearer token.
 * Keys are stored only as SHA-256 hashes — the plaintext is shown to the user
 * exactly once, at generation time.
 */

const API_KEY_PREFIX = "relay_sk_"

export function generateApiKey(): { key: string; hash: string } {
  const key = API_KEY_PREFIX + randomBytes(24).toString("hex")
  return { key, hash: hashApiKey(key) }
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization")
  if (!header) return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}

/**
 * Resolves the User for a request authenticated with a Bearer API key.
 * Returns null when the token is missing or does not match any user.
 */
export async function getUserFromApiKey(request: Request) {
  const token = getBearerToken(request)
  if (!token) return null

  const user = await prisma.user.findUnique({
    where: { apiKey: hashApiKey(token) },
  })
  return user
}

/* ── CORS ── */

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
}

/** 204 response for CORS preflight (OPTIONS) requests. */
export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

/** JSON response with CORS headers attached, for extension-facing endpoints. */
export function jsonWithCors(data: unknown, init?: { status?: number }): Response {
  return new Response(JSON.stringify(data), {
    status: init?.status ?? 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  })
}
