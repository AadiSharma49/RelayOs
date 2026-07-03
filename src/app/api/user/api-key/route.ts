import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/api-utils"
import { generateApiKey } from "@/lib/api-auth"

/**
 * GET  — reports whether the user has an API key (never returns the plaintext;
 *        keys are shown only once at creation time). Does NOT auto-generate.
 * POST — generates a fresh key (invalidating any previous one) and returns the
 *        plaintext ONCE.
 *
 * Both require a signed-in Clerk session. The server stores only the key's
 * SHA-256 hash; the plaintext is pasted into the browser extension.
 */

export async function GET() {
  try {
    const user = await getOrCreateUser()
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { apiKey: true },
    })
    return NextResponse.json({ hasKey: !!dbUser?.apiKey })
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
