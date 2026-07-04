import { prisma } from "@/lib/prisma"
import { getUserFromApiKey, corsPreflight, jsonWithCors } from "@/lib/api-auth"

/**
 * GET /api/mcp/questions
 * Lists the caller's open questions for the RelayOS MCP server, newest first.
 * Authenticated with a Bearer API key. Defaults to open questions; pass
 * status=all to include resolved ones.
 *
 * Query params: workspaceId?, status? (default "open", or "all"), limit? (default 20, max 100)
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
  const status = searchParams.get("status") || "open"
  const limit = clampLimit(searchParams.get("limit"), 20, 100)

  const questions = await prisma.question.findMany({
    where: {
      userId: user.id,
      ...(workspaceId ? { workspaceId } : {}),
      ...(status !== "all" ? { status } : {}),
    },
    select: {
      id: true,
      question: true,
      status: true,
      workspaceId: true,
      createdAt: true,
      workspace: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return jsonWithCors({
    questions: questions.map((q) => ({
      id: q.id,
      question: q.question,
      status: q.status,
      workspaceId: q.workspaceId,
      workspace: q.workspace.name,
      createdAt: q.createdAt,
    })),
  })
}

function clampLimit(raw: string | null, fallback: number, max: number): number {
  const n = raw ? parseInt(raw, 10) : NaN
  if (Number.isNaN(n)) return fallback
  return Math.min(Math.max(n, 1), max)
}
