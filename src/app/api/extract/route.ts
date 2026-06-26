import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"
import { getProvider } from "@/lib/ai/providers/registry"
import type { ExtractionResult } from "@/lib/ai/providers/provider"

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()

    let body: { conversationId?: string }
    try { body = await request.json() } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { conversationId } = body

    if (!conversationId || typeof conversationId !== "string") {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 })
    }

    // Fetch conversation with ownership validation
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: { workspace: { select: { id: true, name: true } } },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Run extraction via provider registry
    let result: ExtractionResult
    try {
      const provider = getProvider()
      result = await provider.extractConversation(conversation.content)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Extraction failed"
      console.error("[extract] Error:", message)
      return NextResponse.json(
        { error: "AI extraction failed. Please try again later.", code: "EXTRACTION_FAILED" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      conversationId: conversation.id,
      workspaceId: conversation.workspaceId,
      workspaceName: conversation.workspace.name,
      conversationTitle: conversation.title,
      result,
    })
  } catch (error) {
    console.error("[extract] Unexpected error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to extract" }, { status: 500 })
  }
}