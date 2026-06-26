import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()

    if (!q) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { workspace: { select: { id: true, name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 50,
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Conversation search error:", error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: "Failed to search conversations" },
      { status: 500 }
    )
  }
}