import { fetchWithRetry } from "./fetch-retry"

/**
 * Text embeddings via Google's `text-embedding-004` model (768 dimensions),
 * used for semantic search over decisions. Retries transient failures.
 */

const EMBED_MODEL = "text-embedding-004"
export const EMBED_DIM = 768

export async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.")
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${apiKey}`
  const res = await fetchWithRetry(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${EMBED_MODEL}`,
      content: { parts: [{ text: text.slice(0, 8000) }] },
    }),
  })

  if (!res.ok) {
    const t = await res.text().catch(() => "")
    throw new Error(`Embedding API error (${res.status}): ${t.slice(0, 200)}`)
  }

  const data = await res.json()
  const values = data?.embedding?.values
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Embedding API returned no vector")
  }
  return values as number[]
}

/** Serialize a vector for a pgvector literal, e.g. "[0.1,0.2,...]". */
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`
}
