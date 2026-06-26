import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserId } from "@/lib/api-utils"

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    const workspaces = await prisma.workspace.findMany({
      where: { userId },
      include: { _count: { select: { conversations: true } } },
      orderBy: { updatedAt: "desc" },
    })
    return NextResponse.json(workspaces)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    console.log("[workspace] Creating workspace for userId:", userId)

    let body: { name?: string }
    try {
      body = await request.json()
      console.log("[workspace] Request body:", JSON.stringify(body))
    } catch {
      console.error("[workspace] Invalid JSON in request body")
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { name } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    console.log("[workspace] Creating workspace with name:", name.trim(), "userId:", userId)

    const workspace = await prisma.workspace.create({
      data: { name: name.trim(), userId },
    })
    console.log("[workspace] Created workspace:", workspace.id)
    return NextResponse.json(workspace, { status: 201 })
  } catch (error) {
    console.error("Workspace creation error:", error instanceof Error ? error.message : error)
    console.error("Workspace creation stack:", error instanceof Error ? error.stack : "No stack")
    const message = error instanceof Error ? error.message : "Failed to create workspace"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}