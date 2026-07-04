import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"
import { embedText, toVectorLiteral } from "@/lib/ai/embeddings"

/**
 * Generates semantic-search embeddings for the user's decisions.
 * GET  — returns { total, embedded, remaining } so the UI can show progress.
 * POST — embeds one batch (keeps requests short); the UI calls it repeatedly
 *        until `remaining` reaches 0.
 */

const BATCH = 20

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    const [row] = (await prisma.$queryRawUnsafe(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(embedding)::int AS embedded
       FROM "Decision" WHERE "userId" = $1`,
      userId
    )) as Array<{ total: number; embedded: number }>

    const total = row?.total ?? 0
    const embedded = row?.embedded ?? 0
    return NextResponse.json({ total, embedded, remaining: total - embedded })
  } catch (error) {
    console.error("[backfill] GET error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to read status" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const userId = await getCurrentUserId()

    const rows = (await prisma.$queryRawUnsafe(
      `SELECT id, title, summary FROM "Decision"
       WHERE "userId" = $1 AND embedding IS NULL
       ORDER BY "createdAt" DESC
       LIMIT ${BATCH}`,
      userId
    )) as Array<{ id: string; title: string; summary: string }>

    let embedded = 0
    for (const d of rows) {
      try {
        const vec = await embedText(`${d.title}\n\n${d.summary}`)
        await prisma.$executeRawUnsafe(
          `UPDATE "Decision" SET embedding = $1::vector WHERE id = $2`,
          toVectorLiteral(vec),
          d.id
        )
        embedded += 1
      } catch (err) {
        console.error("[backfill] embed failed for", d.id, err instanceof Error ? err.message : err)
      }
    }

    const [remainingRow] = (await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS c FROM "Decision" WHERE "userId" = $1 AND embedding IS NULL`,
      userId
    )) as Array<{ c: number }>

    return NextResponse.json({ embedded, remaining: remainingRow?.c ?? 0 })
  } catch (error) {
    console.error("[backfill] POST error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to generate embeddings" }, { status: 500 })
  }
}
