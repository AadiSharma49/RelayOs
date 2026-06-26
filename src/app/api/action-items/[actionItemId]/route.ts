import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ actionItemId: string }> }
) {
  try {
    const { actionItemId } = await params
    const userId = await getCurrentUserId()
    let body: { title?: string; description?: string; status?: string; priority?: string }
    try { body = await request.json() } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const existing = await prisma.actionItem.findFirst({ where: { id: actionItemId, userId } })
    if (!existing) return NextResponse.json({ error: "Action item not found" }, { status: 404 })

    const updated = await prisma.actionItem.update({
      where: { id: actionItemId },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.description !== undefined && { description: body.description.trim() }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.priority !== undefined && { priority: body.priority }),
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update action item:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to update action item" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ actionItemId: string }> }
) {
  try {
    const { actionItemId } = await params
    const userId = await getCurrentUserId()
    const existing = await prisma.actionItem.findFirst({ where: { id: actionItemId, userId } })
    if (!existing) return NextResponse.json({ error: "Action item not found" }, { status: 404 })

    await prisma.actionItem.delete({ where: { id: actionItemId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete action item:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to delete action item" }, { status: 500 })
  }
}