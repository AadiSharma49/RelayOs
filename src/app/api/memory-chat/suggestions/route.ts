import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/api-utils"

/**
 * GET /api/memory-chat/suggestions?workspaceId=...
 * Returns starter questions tailored to what's actually stored in the workspace
 * (its real decisions, action items and questions) instead of a hardcoded list.
 * Deterministic — no AI call — so it's instant and free.
 */

const DEFAULTS = [
  "What decisions have been made in this workspace?",
  "What action items are still pending?",
  "Which questions are still unresolved?",
  "Give me an overview of this workspace.",
]

/** Turns a decision title into a natural "Why did we…?" question. */
function decisionToQuestion(title: string): string {
  const clean = title.trim().replace(/[.?!]+$/, "")
  const stripped = clean.replace(
    /^(the\s+)?(user|we|team|they|i)\s+(decided|chose|agreed|opted|selected)\s+(to\s+)?/i,
    ""
  )
  if (stripped && stripped !== clean) {
    const phrase = stripped.charAt(0).toLowerCase() + stripped.slice(1)
    return `Why did we ${phrase}?`
  }
  const short = clean.length > 70 ? clean.slice(0, 70) + "…" : clean
  return `Tell me more about the decision: "${short}".`
}

export async function GET(request: Request) {
  try {
    const user = await getOrCreateUser()
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 })
    }

    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: user.id },
    })
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    const [decisions, actionItems, questions] = await Promise.all([
      prisma.decision.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { title: true },
      }),
      prisma.actionItem.findMany({ where: { workspaceId }, select: { status: true } }),
      prisma.question.findMany({ where: { workspaceId }, select: { status: true } }),
    ])

    const suggestions: string[] = []

    // Decision-specific questions using real titles
    for (const d of decisions.slice(0, 2)) {
      suggestions.push(decisionToQuestion(d.title))
    }
    if (decisions.length > 0) {
      suggestions.push("Summarize the key decisions in this workspace.")
    }
    if (actionItems.some((a) => a.status !== "completed")) {
      suggestions.push("What action items are still pending?")
    }
    if (questions.some((q) => q.status !== "resolved")) {
      suggestions.push("Which questions are still unresolved?")
    }
    suggestions.push("Give me an overview of this workspace.")

    const unique = Array.from(new Set(suggestions.filter((s) => s.trim()))).slice(0, 6)

    return NextResponse.json({ suggestions: unique.length > 0 ? unique : DEFAULTS })
  } catch (error) {
    console.error(
      "[memory-chat/suggestions] error:",
      error instanceof Error ? error.message : error
    )
    // Never block the UI — fall back to generic prompts.
    return NextResponse.json({ suggestions: DEFAULTS })
  }
}
