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

export class OpenRouterProvider implements AIProvider {
  readonly name = "openrouter" as const
  readonly model: string

  constructor() {
    this.model = process.env.AI_MODEL || "openai/gpt-4o-mini"
  }

  async extractConversation(content: string): Promise<ExtractionResult> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured")
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "RelayOS",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(content) },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "Unknown error")
      throw new Error(`OpenRouter API error (${response.status}): ${text.slice(0, 300)}`)
    }

    const data = await response.json()
    const rawContent = data.choices?.[0]?.message?.content
    if (!rawContent) {
      throw new Error("OpenRouter returned empty response")
    }

    const jsonStr = rawContent.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim()
    const result = JSON.parse(jsonStr) as ExtractionResult

    if (!Array.isArray(result.decisions)) result.decisions = []
    if (!Array.isArray(result.actionItems)) result.actionItems = []
    if (!Array.isArray(result.questions)) result.questions = []

    return result
  }

  async healthCheck(): Promise<ProviderHealth> {
    const apiKey = process.env.OPENROUTER_API_KEY
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
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
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

export function createOpenRouterProvider(): AIProvider {
  return new OpenRouterProvider()
}