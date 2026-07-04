import { getUserFromApiKey, corsPreflight, jsonWithCors } from "@/lib/api-auth"
import { searchDecisions } from "@/lib/search/decisions"

/**
 * POST /api/mcp/search
 * Semantic search over the caller's decisions, for the RelayOS MCP server.
 * Authenticated with a Bearer API key (same keys the browser extension uses).
 *
 * Body: { query: string, workspaceId?: string, limit?: number }
 * Returns: { results: [{ id, title, summary, status, workspaceId, similarity }] }
 */

export async function OPTIONS() {
  return corsPreflight()
}

export async function POST(request: Request) {
  const user = await getUserFromApiKey(request)
  if (!user) {
    return jsonWithCors({ error: "Invalid or missing API key" }, { status: 401 })
  }

  let body: { query?: string; workspaceId?: string; limit?: number }
  try {
    body = await request.json()
  } catch {
    return jsonWithCors({ error: "Invalid JSON" }, { status: 400 })
  }

  const query = body.query?.trim()
  if (!query) {
    return jsonWithCors({ error: "query is required" }, { status: 400 })
  }

  try {
    const results = await searchDecisions(user.id, query, {
      workspaceId: body.workspaceId,
      limit: body.limit,
    })
    return jsonWithCors({ results })
  } catch (error) {
    console.error("[mcp/search] error:", error instanceof Error ? error.message : error)
    return jsonWithCors({ error: "Search failed" }, { status: 500 })
  }
}
