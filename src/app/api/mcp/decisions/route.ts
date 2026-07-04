import { prisma } from "@/lib/prisma"
import { getUserFromApiKey, corsPreflight, jsonWithCors } from "@/lib/api-auth"

/**
 * GET /api/mcp/decisions
 * Lists the caller's most recent decisions for the RelayOS MCP server.
 * Authenticated with a Bearer API key.
 *
 * Query params: workspaceId?, status?, limit? (default 20, max 100)
 * Returns: { decisions: [{ id, title, summary, status, confidence, source,
 *            workspaceId, workspace, createdAt }] }
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
  const status = searchParams.get("status") || undefined
  const limit = clampLimit(searchParams.get("limit"), 20, 100)

  const decisions = await prisma.decision.findMany({
    where: { userId: user.id, ...(workspaceId ? { workspaceId } : {}), ...(status ? { status } : {}) },
    select: {
      id: true,
      title: true,
      summary: true,
      status: true,
      confidence: true,
      source: true,
      workspaceId: true,
      createdAt: true,
      workspace: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return jsonWithCors({
    decisions: decisions.map((d) => ({
      id: d.id,
      title: d.title,
      summary: d.summary,
      status: d.status,
      confidence: d.confidence,
      source: d.source,
      workspaceId: d.workspaceId,
      workspace: d.workspace.name,
      createdAt: d.createdAt,
    })),
  })
}

function clampLimit(raw: string | null, fallback: number, max: number): number {
  const n = raw ? parseInt(raw, 10) : NaN
  if (Number.isNaN(n)) return fallback
  return Math.min(Math.max(n, 1), max)
}
