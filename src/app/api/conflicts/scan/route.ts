import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"
import { scanConflicts } from "@/lib/conflicts/detect"

/**
 * POST /api/conflicts/scan
 * Scans the user's decisions for contradictions. Optionally scoped to one
 * workspace. Runs on demand (it makes an AI call), triggered by the UI button.
 *
 * Body: { workspaceId?: string }
 * Returns: { conflicts, pairsChecked }
 */

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()

    let body: { workspaceId?: string } = {}
    try {
      body = await request.json()
    } catch {
      /* empty body is fine — scan everything */
    }

    if (body.workspaceId) {
      const owns = await prisma.workspace.findFirst({
        where: { id: body.workspaceId, userId },
        select: { id: true },
      })
      if (!owns) {
        return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
      }
    }

    const result = await scanConflicts(userId, body.workspaceId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[conflicts/scan] error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Conflict scan failed. Please try again." }, { status: 500 })
  }
}
