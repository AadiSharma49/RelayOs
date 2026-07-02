import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/api-utils"
import { generateApiKey } from "@/lib/api-auth"

/**
 * GET  — returns the user's API key. If none exists yet, one is generated and
 *        returned in plaintext ONCE. If a key already exists, we only report
 *        that fact (the plaintext is unrecoverable — use POST to regenerate).
 * POST — always generates a fresh key, invalidating the previous one.
 *
 * Both require a signed-in Clerk session. The plaintext key is pasted into the
 * browser extension; the server stores only its SHA-256 hash.
 */

export async function GET() {
  try {
    const user = await getOrCreateUser()
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { apiKey: true },
    })

    if (dbUser?.apiKey) {
      return NextResponse.json({
        hasKey: true,
        key: null,
        message: "An API key already exists. Use regenerate to create a new one.",
      })
    }

    const { key, hash } = generateApiKey()
    await prisma.user.update({ where: { id: user.id }, data: { apiKey: hash } })
    return NextResponse.json({ hasKey: true, key })
  } catch (error) {
    console.error("[api-key] GET error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST() {
  try {
    const user = await getOrCreateUser()
    const { key, hash } = generateApiKey()
    await prisma.user.update({ where: { id: user.id }, data: { apiKey: hash } })
    return NextResponse.json({ hasKey: true, key })
  } catch (error) {
    console.error("[api-key] POST error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
