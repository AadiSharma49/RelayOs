import { prisma } from "@/lib/prisma"
import { getUserFromApiKey, corsPreflight, jsonWithCors } from "@/lib/api-auth"

/**
 * GET /api/mcp/action-items
 * Lists the caller's action items for the RelayOS MCP server, newest first.
 * Authenticated with a Bearer API key. Defaults to pending items so an agent
 * sees outstanding work; pass status=all to include completed ones.
 *
 * Query params: workspaceId?, status? (default "pending", or "all"), limit? (default 20, max 100)
 */

export async function OPTIONS() {
  return corsPreflight()
}

export async function GET(request: Request) {
  const user = await getUserFromApiKey(request)
  if (!user) {
    return jsonWithCors({ error: "Invalid or missing API key" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const workspaceId = searchParams.get("workspaceId") || undefined
  const status = searchParams.get("status") || "pending"
  const limit = clampLimit(searchParams.get("limit"), 20, 100)

  const actionItems = await prisma.actionItem.findMany({
    where: {
      userId: user.id,
      ...(workspaceId ? { workspaceId } : {}),
      ...(status !== "all" ? { status } : {}),
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      workspaceId: true,
      createdAt: true,
      workspace: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return jsonWithCors({
    actionItems: actionItems.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      status: a.status,
      priority: a.priority,
      workspaceId: a.workspaceId,
      workspace: a.workspace.name,
      createdAt: a.createdAt,
    })),
  })
}

function clampLimit(raw: string | null, fallback: number, max: number): number {
  const n = raw ? parseInt(raw, 10) : NaN
  if (Number.isNaN(n)) return fallback
  return Math.min(Math.max(n, 1), max)
}
