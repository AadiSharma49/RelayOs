import { prisma } from "@/lib/prisma"
import { judgeConflicts, type Severity } from "@/lib/ai/conflict"

/**
 * Detects contradicting decisions.
 *
 * Two-stage, so it stays cheap and accurate:
 *  1. pgvector self-join finds decision PAIRS in the same workspace whose
 *     embeddings are close (same topic) — the only pairs worth checking.
 *  2. Gemini judges which of those shortlisted pairs actually contradict.
 *
 * Conflicts are only looked for WITHIN a workspace, so "Use Postgres" in one
 * project and "Use Mongo" in another aren't falsely flagged.
 */

// Cosine similarity above which two decisions are "about the same thing".
const SIMILARITY_THRESHOLD = 0.72
// Cap pairs sent to the LLM so a scan stays fast and bounded in cost.
const MAX_PAIRS = 15

interface CandidateRow {
  a_id: string
  a_title: string
  a_summary: string
  b_id: string
  b_title: string
  b_summary: string
  workspace_id: string
  workspace_name: string
  similarity: number
}

export interface ConflictResult {
  reason: string
  severity: Severity
  similarity: number
  workspaceId: string
  workspaceName: string
  a: { id: string; title: string; summary: string }
  b: { id: string; title: string; summary: string }
}

export interface ScanResult {
  conflicts: ConflictResult[]
  pairsChecked: number
}

export async function scanConflicts(userId: string, workspaceId?: string): Promise<ScanResult> {
  const baseSql = `
    SELECT
      a.id AS a_id, a.title AS a_title, a.summary AS a_summary,
      b.id AS b_id, b.title AS b_title, b.summary AS b_summary,
      a."workspaceId" AS workspace_id, w.name AS workspace_name,
      1 - (a.embedding <=> b.embedding) AS similarity
    FROM "Decision" a
    JOIN "Decision" b
      ON a."userId" = b."userId"
     AND a."workspaceId" = b."workspaceId"
     AND a.id < b.id
    JOIN "Workspace" w ON w.id = a."workspaceId"
    WHERE a."userId" = $1
      AND a.embedding IS NOT NULL
      AND b.embedding IS NOT NULL
      AND (1 - (a.embedding <=> b.embedding)) >= $2
  `

  const rows = (
    workspaceId
      ? await prisma.$queryRawUnsafe(
          `${baseSql} AND a."workspaceId" = $3 ORDER BY similarity DESC LIMIT ${MAX_PAIRS}`,
          userId,
          SIMILARITY_THRESHOLD,
          workspaceId
        )
      : await prisma.$queryRawUnsafe(
          `${baseSql} ORDER BY similarity DESC LIMIT ${MAX_PAIRS}`,
          userId,
          SIMILARITY_THRESHOLD
        )
  ) as CandidateRow[]

  if (rows.length === 0) return { conflicts: [], pairsChecked: 0 }

  const judgements = await judgeConflicts(
    rows.map((r) => ({
      aTitle: r.a_title,
      aSummary: r.a_summary,
      bTitle: r.b_title,
      bSummary: r.b_summary,
    }))
  )

  const conflicts: ConflictResult[] = []
  for (const j of judgements) {
    if (!j.conflicts) continue
    const row = rows[j.index]
    if (!row) continue
    conflicts.push({
      reason: j.reason,
      severity: j.severity,
      similarity: row.similarity,
      workspaceId: row.workspace_id,
      workspaceName: row.workspace_name,
      a: { id: row.a_id, title: row.a_title, summary: row.a_summary },
      b: { id: row.b_id, title: row.b_title, summary: row.b_summary },
    })
  }

  // Most severe first.
  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 }
  conflicts.sort((x, y) => order[x.severity] - order[y.severity])

  return { conflicts, pairsChecked: rows.length }
}
