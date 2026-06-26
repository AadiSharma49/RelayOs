/**
 * AI Extractor — Uses OpenRouter to extract decisions, action items, and questions
 * from conversation content. Returns structured JSON only.
 */

export type ExtractionResult = {
  decisions: Array<{
    title: string
    summary: string
    status: "pending" | "accepted" | "rejected" | "deferred"
    confidence: number
  }>
  actionItems: Array<{
    title: string
    description: string
    priority: "low" | "medium" | "high"
  }>
  questions: Array<{
    question: string
  }>
}

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

/**
 * Calls OpenRouter API to extract structured data from conversation content.
 * Retries once if the response is invalid JSON.
 */
export async function extractFromConversation(
  content: string,
  retries = 1
): Promise<ExtractionResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Set it in .env to enable AI extraction."
    )
  }

  const model = process.env.AI_MODEL || "openai/gpt-4o-mini"

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "RelayOS",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: buildUserPrompt(content) },
            ],
            temperature: 0.1,
            max_tokens: 2000,
          }),
        }
      )

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "Unknown error")
        throw new Error(
          `OpenRouter API error (${response.status}): ${errorBody.slice(0, 300)}`
        )
      }

      const data = await response.json()
      const rawContent = data.choices?.[0]?.message?.content

      if (!rawContent) {
        throw new Error("OpenRouter returned empty response")
      }

      // Try to parse JSON — handle potential markdown fences
      const jsonStr = rawContent
        .replace(/```json\s*/gi, "")
        .replace(/```\s*$/g, "")
        .trim()

      const result = JSON.parse(jsonStr) as ExtractionResult

      // Validate shape
      if (!Array.isArray(result.decisions)) result.decisions = []
      if (!Array.isArray(result.actionItems)) result.actionItems = []
      if (!Array.isArray(result.questions)) result.questions = []

      return result
    } catch (error) {
      if (attempt < retries) {
        console.warn(
          `[extractor] Attempt ${attempt + 1} failed, retrying...`,
          error instanceof Error ? error.message : error
        )
        continue
      }
      throw error
    }
  }

  throw new Error("Extraction failed after all retries")
}