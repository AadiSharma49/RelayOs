import { prisma } from "@/lib/prisma"
import { extractAndSave } from "@/lib/ai/extract-and-save"
import { getUserFromApiKey, corsPreflight, jsonWithCors } from "@/lib/api-auth"

/**
 * POST /api/extension/import
 * The browser extension's one-click capture endpoint. Authenticated with a
 * Bearer API key.
 *
 * Flow: validate workspace ownership -> create the Conversation -> run AI
 * extraction -> auto-save the extracted decisions, action items and questions.
 * The conversation is always saved even if extraction fails, so no capture is
 * ever lost; the failure is reported back in `extractionError`.
 *
 * Body: { workspaceId: string, text: string, source?: string, title?: string }
 * Returns: { conversationId, title, counts, extractionError, duplicate? }
 */

export async function OPTIONS() {
  return corsPreflight()
}

export async function POST(request: Request) {
  const user = await getUserFromApiKey(request)
  if (!user) {
    return jsonWithCors({ error: "Invalid or missing API key" }, { status: 401 })
  }

  let body: { workspaceId?: string; text?: string; source?: string; title?: string; occurredAt?: string | number }
  try {
    body = await request.json()
  } catch {
    return jsonWithCors({ error: "Invalid JSON" }, { status: 400 })
  }

  const { workspaceId, text, source } = body
  if (!workspaceId || typeof workspaceId !== "string") {
    return jsonWithCors({ error: "workspaceId is required" }, { status: 400 })
  }
  if (!text || typeof text !== "string" || !text.trim()) {
    return jsonWithCors({ error: "text is required" }, { status: 400 })
  }

  // Verify the workspace belongs to the API key's owner
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: user.id },
  })
  if (!workspace) {
    return jsonWithCors({ error: "Workspace not found" }, { status: 404 })
  }

  const title = body.title?.trim() || deriveTitle(text, source)

  // Same text already captured in this workspace? Return it instead of duplicating.
  const existing = await prisma.conversation.findFirst({
    where: { workspaceId, userId: user.id, content: text.trim() },
    select: { id: true, title: true },
  })
  if (existing) {
    return jsonWithCors(
      {
        conversationId: existing.id,
        title: existing.title,
        counts: { decisions: 0, actionItems: 0, questions: 0 },
        extractionError: null,
        duplicate: true,
      },
      { status: 200 }
    )
  }

  // Always persist the raw conversation first — never lose a capture
  const conversation = await prisma.conversation.create({
    data: { title, content: text.trim(), workspaceId, userId: user.id, occurredAt: parseDate(body.occurredAt) },
  })

  const { counts, error: extractionError } = await extractAndSave({
    text,
    conversationId: conversation.id,
    workspaceId,
    userId: user.id,
    source: source || "extension",
  })

  return jsonWithCors(
    { conversationId: conversation.id, title, counts, extractionError },
    { status: 201 }
  )
}

/** Builds a readable title from the first non-empty line of the conversation. */
function deriveTitle(text: string, source?: string): string {
  const firstLine =
    text
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0) || "Imported conversation"

  const clean = firstLine.replace(/^(Human|Assistant|User|You)\s*:\s*/i, "").slice(0, 80)
  const prefix = source ? `[${source}] ` : ""
  return (prefix + clean).slice(0, 100) || "Imported conversation"
}

/** Accepts an ISO string or epoch ms; returns null if missing/invalid. */
function parseDate(v: string | number | undefined): Date | null {
  if (v === undefined || v === null || v === "") return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}
