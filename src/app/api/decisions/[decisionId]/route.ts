import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ decisionId: string }> }
) {
  try {
    const { decisionId } = await params
    const userId = await getCurrentUserId()

    const decision = await prisma.decision.findFirst({
      where: { id: decisionId, userId },
      include: {
        workspace: { select: { id: true, name: true } },
        conversation: { select: { id: true, title: true } },
      },
    })
    if (!decision) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 })
    }
    return NextResponse.json(decision)
  } catch (error) {
    console.error("Failed to fetch decision:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to fetch decision" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ decisionId: string }> }
) {
  try {
    const { decisionId } = await params
    const userId = await getCurrentUserId()

    let body: { title?: string; summary?: string; status?: string; confidence?: number }
    try { body = await request.json() } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const existing = await prisma.decision.findFirst({
      where: { id: decisionId, userId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 })
    }

    const updated = await prisma.decision.update({
      where: { id: decisionId },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.summary !== undefined && { summary: body.summary.trim() }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.confidence !== undefined && { confidence: body.confidence }),
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update decision:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to update decision" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ decisionId: string }> }
) {
  try {
    const { decisionId } = await params
    const userId = await getCurrentUserId()

    const existing = await prisma.decision.findFirst({
      where: { id: decisionId, userId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 })
    }

    await prisma.decision.delete({ where: { id: decisionId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete decision:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to delete decision" }, { status: 500 })
  }
}