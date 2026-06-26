import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params
    const userId = await getCurrentUserId()
    let body: { question?: string; status?: string }
    try { body = await request.json() } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const existing = await prisma.question.findFirst({ where: { id: questionId, userId } })
    if (!existing) return NextResponse.json({ error: "Question not found" }, { status: 404 })

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        ...(body.question !== undefined && { question: body.question.trim() }),
        ...(body.status !== undefined && { status: body.status }),
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update question:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params
    const userId = await getCurrentUserId()
    const existing = await prisma.question.findFirst({ where: { id: questionId, userId } })
    if (!existing) return NextResponse.json({ error: "Question not found" }, { status: 404 })

    await prisma.question.delete({ where: { id: questionId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete question:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}