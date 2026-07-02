import { prisma } from "@/lib/prisma"
import { getProvider } from "@/lib/ai/providers/registry"
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
 * Returns: { conversationId, title, counts, extractionError }
 */

export async function OPTIONS() {
  return corsPreflight()
}

export async function POST(request: Request) {
  const user = await getUserFromApiKey(request)
  if (!user) {
    return jsonWithCors({ error: "Invalid or missing API key" }, { status: 401 })
  }

  let body: { workspaceId?: string; text?: string; source?: string; title?: string }
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

  // Always persist the raw conversation first — never lose a capture
  const conversation = await prisma.conversation.create({
    data: { title, content: text.trim(), workspaceId, userId: user.id },
  })

  const counts = { decisions: 0, actionItems: 0, questions: 0 }
  let extractionError: string | null = null

  try {
    const provider = getProvider()
    const result = await provider.extractConversation(text)
    const src = source || "extension"

    if (result.decisions?.length) {
      await prisma.decision.createMany({
        data: result.decisions.map((d) => ({
          title: d.title,
          summary: d.summary,
          status: d.status || "pending",
          confidence: typeof d.confidence === "number" ? d.confidence : 0.5,
          source: src,
          conversationId: conversation.id,
          workspaceId,
          userId: user.id,
        })),
      })
      counts.decisions = result.decisions.length
    }

    if (result.actionItems?.length) {
      await prisma.actionItem.createMany({
        data: result.actionItems.map((a) => ({
          title: a.title,
          description: a.description || "",
          status: "pending",
          priority: a.priority || "medium",
          conversationId: conversation.id,
          workspaceId,
          userId: user.id,
        })),
      })
      counts.actionItems = result.actionItems.length
    }

    if (result.questions?.length) {
      await prisma.question.createMany({
        data: result.questions.map((q) => ({
          question: q.question,
          status: "open",
          conversationId: conversation.id,
          workspaceId,
          userId: user.id,
        })),
      })
      counts.questions = result.questions.length
    }
  } catch (error) {
    extractionError = error instanceof Error ? error.message : "Extraction failed"
    console.error("[extension/import] extraction failed:", extractionError)
  }

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
