import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"
import { extractAndSave } from "@/lib/ai/extract-and-save"
import { fetchSharedConversation, ShareImportError } from "@/lib/import/share-url"

/**
 * POST /api/conversations/import-url
 * Imports a public share link (e.g. a ChatGPT share URL) as a conversation.
 *
 * Body: { url: string, workspaceId: string, autoExtract?: boolean }
 * Returns: { conversation, duplicate, counts, extractionError }
 *   201 when created, 200 when the same chat was already imported.
 *   autoExtract (default false) runs AI extraction and saves the results.
 */
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()

    let body: { url?: string; workspaceId?: string; autoExtract?: boolean }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { url, workspaceId } = body
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "A share URL is required" }, { status: 400 })
    }
    if (!workspaceId || typeof workspaceId !== "string") {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 })
    }

    const workspace = await prisma.workspace.findFirst({ where: { id: workspaceId, userId } })
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    const shared = await fetchSharedConversation(url)
    const content = shared.content.trim()
    const counts = { decisions: 0, actionItems: 0, questions: 0 }

    // Same chat already imported into this workspace — reuse it.
    const existing = await prisma.conversation.findFirst({
      where: { workspaceId, userId, content },
    })
    if (existing) {
      // Backfill the real chat date on copies imported before dates were tracked.
      if (!existing.occurredAt && shared.occurredAt) {
        existing.occurredAt = new Date(shared.occurredAt)
        await prisma.conversation.update({
          where: { id: existing.id },
          data: { occurredAt: existing.occurredAt },
        })
      }
      return NextResponse.json(
        { conversation: existing, duplicate: true, counts, extractionError: null },
        { status: 200 }
      )
    }

    const conversation = await prisma.conversation.create({
      data: {
        title: shared.title.slice(0, 100),
        content,
        workspaceId,
        userId,
        occurredAt: shared.occurredAt ? new Date(shared.occurredAt) : null,
      },
    })

    let extractionError: string | null = null
    if (body.autoExtract) {
      const out = await extractAndSave({
        text: content,
        conversationId: conversation.id,
        workspaceId,
        userId,
        source: shared.source,
      })
      Object.assign(counts, out.counts)
      extractionError = out.error
    }

    return NextResponse.json(
      { conversation, duplicate: false, counts, extractionError },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ShareImportError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("[import-url] Error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to import conversation" }, { status: 500 })
  }
}
