import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    const items = await prisma.question.findMany({
      where: { userId },
      include: {
        workspace: { select: { id: true, name: true } },
        conversation: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    return NextResponse.json(items)
  } catch (error) {
    console.error("Failed to fetch questions:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    let body: { question?: string; status?: string; conversationId?: string; workspaceId?: string }
    try { body = await request.json() } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { question, status, conversationId, workspaceId } = body

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }
    if (!workspaceId || typeof workspaceId !== "string") {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 })
    }

    const workspace = await prisma.workspace.findFirst({ where: { id: workspaceId, userId } })
    if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 })

    if (conversationId) {
      const conv = await prisma.conversation.findFirst({ where: { id: conversationId, userId, workspaceId } })
      if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const item = await prisma.question.create({
      data: {
        question: question.trim(),
        status: status || "open",
        conversationId: conversationId || null,
        workspaceId,
        userId,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Failed to create question:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}