import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    console.log("[conversation] user:", userId)

    let body: { title?: string; content?: string; workspaceId?: string }
    try {
      body = await request.json()
    } catch {
      console.error("[conversation] Invalid JSON in request body")
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { title, content, workspaceId } = body
    console.log("[conversation] workspaceId:", workspaceId)
    console.log("[conversation] title:", title)
    console.log("[conversation] content length:", content?.length ?? 0)

    if (!title || typeof title !== "string" || !title.trim()) {
      console.error("[conversation] Validation failed: title is missing or empty")
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (!content || typeof content !== "string" || !content.trim()) {
      console.error("[conversation] Validation failed: content is missing or empty")
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }
    if (!workspaceId || typeof workspaceId !== "string") {
      console.error("[conversation] Validation failed: workspaceId is missing")
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 })
    }

    // Verify workspace belongs to user
    console.log("[conversation] Verifying workspace ownership:", workspaceId)
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    })
    if (!workspace) {
      console.error("[conversation] Workspace not found or not owned by user:", workspaceId)
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    const conversation = await prisma.conversation.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        workspaceId,
        userId,
      },
    })
    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error("[conversation] Error:", error instanceof Error ? error.message : error)
    console.error("[conversation] Stack:", error instanceof Error ? error.stack : "No stack")
    const message = error instanceof Error ? error.message : "Failed to save conversation"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}