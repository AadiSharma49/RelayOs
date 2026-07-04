import { prisma } from "@/lib/prisma"
import { getUserFromApiKey, corsPreflight, jsonWithCors } from "@/lib/api-auth"

/**
 * GET /api/mcp/workspaces
 * Lists the caller's workspaces (with item counts) for the RelayOS MCP server,
 * so an agent can scope other queries to a specific workspace.
 * Authenticated with a Bearer API key.
 */

export async function OPTIONS() {
  return corsPreflight()
}

export async function GET(request: Request) {
  const user = await getUserFromApiKey(request)
  if (!user) {
    return jsonWithCors({ error: "Invalid or missing API key" }, { status: 401 })
  }

  const workspaces = await prisma.workspace.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      _count: { select: { decisions: true, actionItems: true, questions: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return jsonWithCors({
    workspaces: workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      decisions: w._count.decisions,
      actionItems: w._count.actionItems,
      questions: w._count.questions,
    })),
  })
}
