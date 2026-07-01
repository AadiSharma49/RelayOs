import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/api-utils"

export async function DELETE(request: Request) {
  try {
    const user = await getOrCreateUser()

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")

    if (!workspaceId || typeof workspaceId !== "string") {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 })
    }

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: user.id },
    })
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    // Delete all chat messages for this workspace
    await prisma.chatMessage.deleteMany({
      where: { workspaceId, userId: user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}