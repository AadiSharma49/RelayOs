import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const [conversations, decisions, actionItems, questions] = await Promise.all([
      prisma.conversation.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        },
        include: { workspace: { select: { id: true, name: true } } },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      prisma.decision.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
          ],
        },
        include: {
          workspace: { select: { id: true, name: true } },
          conversation: { select: { id: true, title: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      prisma.actionItem.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        include: { workspace: { select: { id: true, name: true } } },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      prisma.question.findMany({
        where: {
          userId,
          OR: [{ question: { contains: q, mode: "insensitive" } }],
        },
        include: { workspace: { select: { id: true, name: true } } },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
    ])

    return NextResponse.json({
      results: {
        conversations: conversations.map((c) => ({
          id: c.id,
          type: "conversation" as const,
          title: c.title,
          description: c.content.slice(0, 120),
          workspaceId: c.workspaceId,
          workspaceName: c.workspace.name,
          url: `/dashboard/workspaces/${c.workspaceId}/conversations/${c.id}`,
        })),
        decisions: decisions.map((d) => ({
          id: d.id,
          type: "decision" as const,
          title: d.title,
          description: d.summary?.slice(0, 120) || "",
          workspaceId: d.workspaceId,
          workspaceName: d.workspace.name,
          url: `/dashboard/workspaces/${d.workspaceId}/decisions/${d.id}`,
        })),
        actionItems: actionItems.map((a) => ({
          id: a.id,
          type: "actionItem" as const,
          title: a.title,
          description: a.description?.slice(0, 120) || "",
          workspaceId: a.workspaceId,
          workspaceName: a.workspace.name,
          url: `/dashboard/workspaces/${a.workspaceId}`,
        })),
        questions: questions.map((q) => ({
          id: q.id,
          type: "question" as const,
          title: q.question,
          description: "",
          workspaceId: q.workspaceId,
          workspaceName: q.workspace.name,
          url: `/dashboard/workspaces/${q.workspaceId}`,
        })),
      },
    })
  } catch (error) {
    console.error("Search error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
