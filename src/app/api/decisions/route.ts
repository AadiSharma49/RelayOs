import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    const decisions = await prisma.decision.findMany({
      where: { userId },
      include: {
        workspace: { select: { id: true, name: true } },
        conversation: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    return NextResponse.json(decisions)
  } catch (error) {
    console.error("Failed to fetch decisions:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to fetch decisions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()

    let body: { title?: string; summary?: string; status?: string; confidence?: number; conversationId?: string; workspaceId?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { title, summary, status, confidence, conversationId, workspaceId } = body

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (!workspaceId || typeof workspaceId !== "string") {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 })
    }

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    })
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    // If conversationId provided, verify it belongs to user and workspace
    if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId, workspaceId },
      })
      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }
    }

    const decision = await prisma.decision.create({
      data: {
        title: title.trim(),
        summary: summary?.trim() || "",
        status: status || "pending",
        confidence: confidence ?? 0.5,
        conversationId: conversationId || null,
        workspaceId,
        userId,
      },
    })
    return NextResponse.json(decision, { status: 201 })
  } catch (error) {
    console.error("Failed to create decision:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to create decision" }, { status: 500 })
  }
}