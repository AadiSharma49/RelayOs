import { AIProvider, type ProviderHealth, type ExtractionResult } from "./provider"
import { fetchWithRetry, isRetryableStatus } from "../fetch-retry"

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

// Cap input so extraction stays fast and the JSON output can't be truncated.
const MAX_INPUT_CHARS = 24000

function buildUserPrompt(content: string): string {
  const trimmed =
    content.length > MAX_INPUT_CHARS
      ? content.slice(0, MAX_INPUT_CHARS) + "\n\n[conversation truncated]"
      : content
  return `Extract decisions, action items, and questions from this conversation:\n\n${trimmed}`
}

function normalizeResult(obj: unknown): ExtractionResult {
  const r = (obj ?? {}) as ExtractionResult
  if (!Array.isArray(r.decisions)) r.decisions = []
  if (!Array.isArray(r.actionItems)) r.actionItems = []
  if (!Array.isArray(r.questions)) r.questions = []
  return r
}

function tryParse(s: string): ExtractionResult | null {
  try {
    return normalizeResult(JSON.parse(s))
  } catch {
    return null
  }
}

/** Robustly parse Gemini output into an ExtractionResult, tolerating stray
 *  markdown fences or leading/trailing prose around the JSON object. */
function parseExtraction(raw: string): ExtractionResult {
  let s = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim()

  const direct = tryParse(s)
  if (direct) return direct

  // Fallback: slice out the outermost { ... } and try again.
  const start = s.indexOf("{")
  const end = s.lastIndexOf("}")
  if (start !== -1 && end > start) {
    const sliced = tryParse(s.slice(start, end + 1))
    if (sliced) return sliced
  }

  throw new Error("The AI returned a malformed response. Please try again.")
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

    const response = await fetchWithRetry(url, {
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
          maxOutputTokens: 8192,
          // Force strict, well-escaped JSON so the response can't break JSON.parse.
          responseMimeType: "application/json",
        },
      }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "Unknown error")
      if (isRetryableStatus(response.status)) {
        throw new Error("The AI model is busy right now. Please try again in a moment.")
      }
      throw new Error(`Gemini API error (${response.status}): ${text.slice(0, 300)}`)
    }

    const data = await response.json()
    const candidate = data.candidates?.[0]
    const raw = candidate?.content?.parts?.[0]?.text
    if (!raw) {
      throw new Error("Gemini returned an empty response. Please try again.")
    }
    if (candidate?.finishReason === "MAX_TOKENS") {
      console.warn("[gemini] extraction hit MAX_TOKENS — output may be truncated")
    }

    return parseExtraction(raw)
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