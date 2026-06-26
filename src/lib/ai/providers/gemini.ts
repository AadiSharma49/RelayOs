import { AIProvider, type ProviderHealth, type ExtractionResult } from "./provider"

const SYSTEM_PROMPT = `You are a decision intelligence extraction engine. Analyze conversations and extract:
1. Decisions — notable choices made, with rationale
2. Action Items — tasks someone agreed to do
3. Questions — unresolved questions raised

Rules:
- Return ONLY valid JSON, no markdown, no code fences, no explanation
- decisions.title must be specific and actionable
- decisions.summary should capture rationale, alternatives considered, and who decided
- decisions.status: "accepted" | "rejected" | "deferred" | "pending"
- decisions.confidence: 0.0 to 1.0 (how clearly was this decision made)
- actionItems.title: specific task
- actionItems.priority: "high" | "medium" | "low"
- questions.question: the exact question as asked

Return format:
{
  "decisions": [{ "title": "...", "summary": "...", "status": "accepted", "confidence": 0.9 }],
  "actionItems": [{ "title": "...", "description": "...", "priority": "medium" }],
  "questions": [{ "question": "..." }]
}

If nothing fits a category, return an empty array for that category.`

function buildUserPrompt(content: string): string {
  return `Extract decisions, action items, and questions from this conversation:\n\n${content}`
}

export class GeminiProvider implements AIProvider {
  readonly name = "gemini" as const
  readonly model: string

  constructor() {
    this.model = process.env.AI_MODEL || "gemini-2.5-flash"
  }

  async extractConversation(content: string): Promise<ExtractionResult> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Set it in .env to enable AI extraction.")
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT + "\n\n" + buildUserPrompt(content) },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "Unknown error")
      throw new Error(`Gemini API error (${response.status}): ${text.slice(0, 300)}`)
    }

    const data = await response.json()
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!raw) {
      throw new Error("Gemini returned empty response")
    }

    const jsonStr = raw.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim()
    const result = JSON.parse(jsonStr) as ExtractionResult

    if (!Array.isArray(result.decisions)) result.decisions = []
    if (!Array.isArray(result.actionItems)) result.actionItems = []
    if (!Array.isArray(result.questions)) result.questions = []

    return result
  }

  async healthCheck(): Promise<ProviderHealth> {
    const apiKey = process.env.GEMINI_API_KEY
    const checkedAt = new Date().toISOString()

    if (!apiKey) {
      return {
        connected: false,
        provider: this.name,
        model: this.model,
        lastCheck: checkedAt,
        available: false,
        error: "Missing API key",
      }
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "ping" }] }],
          generationConfig: { maxOutputTokens: 1 },
        }),
      })

      return {
        connected: response.ok,
        provider: this.name,
        model: this.model,
        lastCheck: checkedAt,
        available: response.ok,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      }
    } catch (error) {
      return {
        connected: false,
        provider: this.name,
        model: this.model,
        lastCheck: checkedAt,
        available: false,
        error: error instanceof Error ? error.message : "Network failure",
      }
    }
  }
}

export function createGeminiProvider(): AIProvider {
  return new GeminiProvider()
}