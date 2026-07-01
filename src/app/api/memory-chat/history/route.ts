import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/api-utils"

export async function GET(request: Request) {
  try {
    const user = await getOrCreateUser()

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")

    if (!workspaceId || typeof workspaceId !== "string") {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 })
    }

    // Validate user owns workspace
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: user.id },
    })
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    // Return last 50 messages ordered by createdAt ascending
    const messages = await prisma.chatMessage.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
      take: 50,
    })

    return NextResponse.json({ messages })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}