import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"

/**
 * POST /api/conversations/import-batch
 * Bulk-creates conversations from a parsed ChatGPT/Claude export.
 * Import is create-only (fast, reliable) — AI extraction is run later per
 * conversation via the existing Extract flow, so a large import can't time out.
 *
 * Body: { workspaceId, conversations: [{ title, content }] }
 */

const MAX_CONVERSATIONS = 300
const MAX_CONTENT_CHARS = 200_000

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()

    let body: {
      workspaceId?: string
      conversations?: Array<{ title?: string; content?: string }>
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { workspaceId, conversations } = body
    if (!workspaceId || typeof workspaceId !== "string") {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 })
    }
    if (!Array.isArray(conversations) || conversations.length === 0) {
      return NextResponse.json({ error: "No conversations to import" }, { status: 400 })
    }

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    })
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    const rows = conversations
      .slice(0, MAX_CONVERSATIONS)
      .map((c) => ({
        title: (c.title || "Imported conversation").trim().slice(0, 200),
        content: typeof c.content === "string" ? c.content.slice(0, MAX_CONTENT_CHARS).trim() : "",
        workspaceId,
        userId,
      }))
      .filter((c) => c.content.length > 0)

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid conversations to import" }, { status: 400 })
    }

    const result = await prisma.conversation.createMany({ data: rows })

    return NextResponse.json(
      {
        imported: result.count,
        skipped: conversations.length - result.count,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[import-batch] error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to import conversations" }, { status: 500 })
  }
}
