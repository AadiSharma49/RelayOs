/**
 * fetch() wrapper with exponential backoff for transient upstream failures.
 *
 * AI providers (Gemini included) regularly return 503 "model overloaded" or 429
 * rate-limit responses under load. These are temporary — retrying after a short,
 * jittered delay usually succeeds. Non-retryable responses (4xx other than 429)
 * are returned immediately so real errors surface fast.
 */

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504])
const MAX_DELAY_MS = 8000

export interface RetryOptions {
  retries?: number
  baseDelayMs?: number
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  opts: RetryOptions = {}
): Promise<Response> {
  const retries = opts.retries ?? 3
  const baseDelay = opts.baseDelayMs ?? 500
  let lastResponse: Response | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    let response: Response
    try {
      response = await fetch(url, init)
    } catch (err) {
      // Network-level failure — retry unless this was the last attempt.
      if (attempt === retries) throw err
      await sleep(backoff(baseDelay, attempt))
      continue
    }

    if (!RETRYABLE_STATUS.has(response.status) || attempt === retries) {
      return response
    }

    lastResponse = response
    const retryAfter = parseRetryAfter(response.headers.get("retry-after"))
    await sleep(retryAfter ?? backoff(baseDelay, attempt))
  }

  // Unreachable in practice, but keeps the type checker happy.
  return lastResponse as Response
}

/** True for statuses worth retrying — exported so callers can classify errors. */
export function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUS.has(status)
}

function backoff(base: number, attempt: number): number {
  const exponential = base * 2 ** attempt
  const jitter = Math.random() * base
  return Math.min(exponential + jitter, MAX_DELAY_MS)
}

function parseRetryAfter(value: string | null): number | null {
  if (!value) return null
  const seconds = Number(value)
  return Number.isFinite(seconds) ? seconds * 1000 : null
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
