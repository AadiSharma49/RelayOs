import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    const userId = await getCurrentUserId()

    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
      include: {
        conversations: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(workspace)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workspace" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    const userId = await getCurrentUserId()
    const { name } = await request.json()

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    })
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      )
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: name.trim() },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update workspace" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    const userId = await getCurrentUserId()

    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    })
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      )
    }

    await prisma.workspace.delete({ where: { id: workspaceId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    )
  }
}