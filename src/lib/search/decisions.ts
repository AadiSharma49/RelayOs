import { prisma } from "@/lib/prisma"
import { embedText, toVectorLiteral } from "@/lib/ai/embeddings"

/**
 * Semantic search over a user's decisions using pgvector cosine similarity.
 *
 * Shared by the dashboard search route (Clerk session auth) and the MCP route
 * (API-key auth) so ranking behaviour stays identical everywhere. Only rows
 * that already have an embedding are searchable — un-embedded decisions are
 * skipped until the backfill runs.
 */

export interface DecisionSearchResult {
  id: string
  title: string
  summary: string
  status: string
  workspaceId: string
  similarity: number
}

export async function searchDecisions(
  userId: string,
  query: string,
  opts?: { workspaceId?: string; limit?: number }
): Promise<DecisionSearchResult[]> {
  const vec = await embedText(query)
  const literal = toVectorLiteral(vec)
  const limit = Math.min(Math.max(opts?.limit ?? 10, 1), 50)

  const rows = opts?.workspaceId
    ? await prisma.$queryRawUnsafe(
        `SELECT id, title, summary, status, "workspaceId",
                1 - (embedding <=> $1::vector) AS similarity
         FROM "Decision"
         WHERE "userId" = $2 AND "workspaceId" = $3 AND embedding IS NOT NULL
         ORDER BY embedding <=> $1::vector
         LIMIT ${limit}`,
        literal,
        userId,
        opts.workspaceId
      )
    : await prisma.$queryRawUnsafe(
        `SELECT id, title, summary, status, "workspaceId",
                1 - (embedding <=> $1::vector) AS similarity
         FROM "Decision"
         WHERE "userId" = $2 AND embedding IS NOT NULL
         ORDER BY embedding <=> $1::vector
         LIMIT ${limit}`,
        literal,
        userId
      )

  return rows as DecisionSearchResult[]
}
