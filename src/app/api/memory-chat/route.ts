import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/api-utils"
import { fetchWithRetry, isRetryableStatus } from "@/lib/ai/fetch-retry"

const SYSTEM_PROMPT = `You are RelayOS, a decision intelligence assistant. Your role is to answer questions about a workspace using ONLY the provided context.

The context contains structured information from the workspace:
- Decisions - notable choices made, with rationale
- Action Items - tasks someone agreed to do
- Questions - unresolved questions raised

RULES:
1. Answer ONLY using the information provided in the context below.
2. If the context does not contain enough information to answer the question, respond with exactly:
   I don't have enough stored information about that yet.
3. Be concise and direct. 2-4 sentences or a short bullet list.
4. Do NOT include any 'Referenced Decisions', 'Referenced Action Items', or 'Referenced Questions' sections in your answer. Sources are handled separately.
5. Never hallucinate or make up information.

Current context for this workspace:`

interface Decision {
  id: string
  title: string
  summary: string
  status: string
  confidence: number
}

interface ActionItem {
  id: string
  title: string
  description: string
  status: string
  priority: string
}

interface Question {
  id: string
  question: string
  status: string
}

function buildContext(decisions: Decision[], actionItems: ActionItem[], questions: Question[]) {
  const parts: string[] = []

  if (decisions.length > 0) {
    parts.push("=== DECISIONS ===")
    decisions.forEach((d: Decision, i: number) => {
      parts.push(
        `[${i + 1}] Title: ${d.title}
    Summary: ${d.summary}
    Status: ${d.status}
    Confidence: ${d.confidence}`
      )
    })
  }

  if (actionItems.length > 0) {
    parts.push("\n=== ACTION ITEMS ===")
    actionItems.forEach((a: ActionItem, i: number) => {
      parts.push(
        `[${i + 1}] Title: ${a.title}
    Description: ${a.description || "No description"}
    Status: ${a.status}
    Priority: ${a.priority}`
      )
    })
  }

  if (questions.length > 0) {
    parts.push("\n=== QUESTIONS ===")
    questions.forEach((q: Question, i: number) => {
      parts.push(
        `[${i + 1}] Question: ${q.question}
    Status: ${q.status}`
      )
    })
  }

  return parts.join("\n")
}

export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser()

    let body: { workspaceId?: string; message?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { workspaceId, message } = body

    if (!workspaceId || typeof workspaceId !== "string") {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 })
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 })
    }

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId: user.id },
    })
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    // Fetch all decisions, action items, questions for the workspace
    const [decisions, actionItems, questions] = await Promise.all([
      prisma.decision.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } }),
      prisma.actionItem.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } }),
      prisma.question.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" } }),
    ])

    // Build structured context
    const context = buildContext(decisions, actionItems, questions)

    // If no context exists, return early
    if (!context.trim()) {
      const noContextAnswer = "I don't have enough stored information about that yet. This workspace has no decisions, action items, or questions stored."
      const emptySources = { decisions: [], actionItems: [], questions: [] }

      // Save both messages
      await prisma.chatMessage.createMany({
        data: [
          { workspaceId, userId: user.id, role: "user", content: message },
          { workspaceId, userId: user.id, role: "assistant", content: noContextAnswer, sources: emptySources },
        ],
      })

      return NextResponse.json({
        answer: noContextAnswer,
        sources: emptySources,
        relatedQuestions: [],
      })
    }

    // Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Set it in .env to enable Memory Chat." },
        { status: 500 }
      )
    }

    const model = process.env.AI_MODEL || "gemini-2.5-flash"
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const prompt = `${SYSTEM_PROMPT}

${context}

User Question: ${message}`

    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
      }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "")
      console.error(`[memory-chat] Gemini error ${response.status}: ${text.slice(0, 300)}`)
      // Transient overload/rate-limit — the retries above are already exhausted.
      if (isRetryableStatus(response.status)) {
        return NextResponse.json(
          { error: "The AI model is busy right now. Please try again in a moment.", code: "AI_BUSY" },
          { status: 503 }
        )
      }
      return NextResponse.json(
        { error: "The AI request failed. Please try again.", code: "AI_ERROR" },
        { status: 502 }
      )
    }

    const data = await response.json()
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!raw) {
      throw new Error("Gemini returned empty response")
    }

    const answer = raw.trim()

    // Generate related follow-up questions
    let relatedQuestions: string[] = []
    try {
      const relatedPrompt = `Based on this question: "${message}"
And this answer: "${answer}"

Generate exactly 3 short follow-up questions a user might want to ask next about their project decisions.

Rules:
- Each question must be under 10 words
- Questions must be directly related to the answer given
- Do not repeat the original question
- Return ONLY a JSON array of 3 strings, nothing else
- Example format: ["Question one?", "Question two?", "Question three?"]`

      const questionsResponse = await fetchWithRetry(
        url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: relatedPrompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 150 },
          }),
        },
        { retries: 1 }
      )

      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        const questionsText = questionsData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "[]"
        relatedQuestions = JSON.parse(questionsText)
        relatedQuestions = relatedQuestions.filter((q: string) =>
          q.toLowerCase() !== message.toLowerCase()
        ).slice(0, 3)
      }
    } catch {
      relatedQuestions = []
    }

    // Determine which sources were referenced
    const referencedDecisions = decisions.filter((d) =>
      answer.toLowerCase().includes(d.title.toLowerCase())
    )
    const referencedActionItems = actionItems.filter((a) =>
      answer.toLowerCase().includes(a.title.toLowerCase())
    )
    const referencedQuestions = questions.filter((q) =>
      answer.toLowerCase().includes(q.question.toLowerCase())
    )

    // Build sources array
    const sources = {
      decisions: referencedDecisions.map((d) => ({
        id: d.id,
        title: d.title,
        summary: d.summary,
        status: d.status,
      })),
      actionItems: referencedActionItems.map((a) => ({
        id: a.id,
        title: a.title,
        status: a.status,
        priority: a.priority,
      })),
      questions: referencedQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        status: q.status,
      })),
    }

    // Save both messages to database
    await prisma.chatMessage.createMany({
      data: [
        { workspaceId, userId: user.id, role: "user", content: message },
        { workspaceId, userId: user.id, role: "assistant", content: answer, sources },
      ],
    })

    return NextResponse.json({
      answer,
      sources,
      relatedQuestions,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}