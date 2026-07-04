import { NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/api-utils"
import { searchDecisions } from "@/lib/search/decisions"

/**
 * POST /api/search/semantic
 * Embeds the query and returns the user's decisions ranked by cosine similarity
 * (meaning, not keywords). Optionally scoped to a workspace.
 *
 * Body: { query: string, workspaceId?: string }
 * Returns: { results: [{ id, title, summary, status, workspaceId, similarity }] }
 */

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()

    let body: { query?: string; workspaceId?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const query = body.query?.trim()
    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 })
    }

    const results = await searchDecisions(userId, query, { workspaceId: body.workspaceId })
    return NextResponse.json({ results })
  } catch (error) {
    console.error("[semantic-search] error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Search failed. Please try again." }, { status: 500 })
  }
}
