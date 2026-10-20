/**
 * Fetches a publicly shared AI chat link and turns it into a transcript.
 *
 * Providers (host allowlist — we never fetch arbitrary hosts, which keeps this
 * endpoint safe from SSRF):
 *   chatgpt     chatgpt.com/share/…, chat.openai.com/share/…   (dedicated parser)
 *   claude      claude.ai/share/…                              (snapshot API, then generic)
 *   gemini      gemini.google.com/share/…, g.co/gemini/share/… (generic)
 *   perplexity  perplexity.ai/search/…, /page/…                (generic)
 *   grok        grok.com/share/…                               (generic)
 *   deepseek    chat.deepseek.com/share/…                      (generic)
 *   copilot     copilot.microsoft.com/shares/…                 (generic)
 *   poe         poe.com/s/…                                    (generic)
 *   mistral     chat.mistral.ai/chat/…                         (generic)
 *
 * "Generic" = look for embedded JSON that contains role/text message arrays,
 * and otherwise fall back to the page's visible text. Only ChatGPT is verified
 * against a live link; the others are best-effort and may need tuning per
 * provider as their share pages change.
 */

export type ShareSource =
  | "chatgpt"
  | "claude"
  | "gemini"
  | "perplexity"
  | "grok"
  | "deepseek"
  | "copilot"
  | "poe"
  | "mistral"

export interface SharedConversation {
  title: string
  content: string
  messageCount: number
  /** When the chat happened (ms epoch), if the page exposes it. */
  occurredAt: number | null
  source: ShareSource
}

export class ShareImportError extends Error {
  constructor(message: string, readonly status = 422) {
    super(message)
  }
}

interface ProviderRule {
  source: ShareSource
  label: string
  hosts: string[]
  path: RegExp
}

const PROVIDERS: ProviderRule[] = [
  { source: "chatgpt", label: "ChatGPT", hosts: ["chatgpt.com", "www.chatgpt.com", "chat.openai.com"], path: /^\/share\/(e\/)?[0-9a-f-]{8,}\/?$/i },
  { source: "claude", label: "Claude", hosts: ["claude.ai"], path: /^\/share\/[0-9a-f-]{8,}\/?$/i },
  { source: "gemini", label: "Gemini", hosts: ["gemini.google.com", "g.co"], path: /^\/(app\/)?(gemini\/)?share\/[\w-]+\/?$/i },
  { source: "perplexity", label: "Perplexity", hosts: ["perplexity.ai", "www.perplexity.ai"], path: /^\/(search|page)\/[\w-]+\/?$/i },
  { source: "grok", label: "Grok", hosts: ["grok.com"], path: /^\/share\/[\w-]+\/?$/i },
  { source: "deepseek", label: "DeepSeek", hosts: ["chat.deepseek.com"], path: /^\/share\/[\w-]+\/?$/i },
  { source: "copilot", label: "Copilot", hosts: ["copilot.microsoft.com"], path: /^\/shares\/[\w-]+\/?$/i },
  { source: "poe", label: "Poe", hosts: ["poe.com"], path: /^\/s\/[\w-]+\/?$/i },
  { source: "mistral", label: "Le Chat", hosts: ["chat.mistral.ai"], path: /^\/chat\/[\w-]+\/?$/i },
]

export const SUPPORTED_PROVIDER_LABELS = PROVIDERS.map((p) => p.label)

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
const MAX_BYTES = 8 * 1024 * 1024
const MAX_REDIRECTS = 4

function matchProvider(url: URL): ProviderRule | null {
  return (
    PROVIDERS.find((p) => p.hosts.includes(url.hostname.toLowerCase()) && p.path.test(url.pathname)) ?? null
  )
}

export function parseShareUrl(raw: string): { source: ShareSource; url: URL } {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    throw new ShareImportError("That doesn't look like a valid URL.", 400)
  }
  if (url.protocol !== "https:") {
    throw new ShareImportError("Only https share links are supported.", 400)
  }
  const rule = matchProvider(url)
  if (!rule) {
    throw new ShareImportError(
      `Unsupported link. Paste a public share link from: ${SUPPORTED_PROVIDER_LABELS.join(", ")}.`,
      400
    )
  }
  return { source: rule.source, url }
}

/** Fetches with manual redirects so every hop stays on an allowlisted host. */
async function safeFetch(start: URL, accept: string): Promise<Response> {
  let url = start
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let res: Response
    try {
      res = await fetch(url.toString(), {
        headers: { "User-Agent": BROWSER_UA, Accept: accept, "Accept-Language": "en-US,en;q=0.9" },
        redirect: "manual",
        signal: AbortSignal.timeout(20_000),
        cache: "no-store",
      })
    } catch {
      throw new ShareImportError("Couldn't reach the share link. Check the URL and try again.", 502)
    }
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location")
      if (!loc) throw new ShareImportError("The share link redirected somewhere unusable.", 502)
      const next = new URL(loc, url)
      const allowed = next.protocol === "https:" && PROVIDERS.some((p) => p.hosts.includes(next.hostname.toLowerCase()))
      if (!allowed) throw new ShareImportError("The share link redirected to an unsupported site.", 400)
      url = next
      continue
    }
    return res
  }
  throw new ShareImportError("The share link redirected too many times.", 502)
}

async function readText(res: Response): Promise<string> {
  const text = await res.text()
  if (text.length > MAX_BYTES) throw new ShareImportError("This shared conversation is too large to import.", 413)
  return text
}

export async function fetchSharedConversation(raw: string): Promise<SharedConversation> {
  const { source, url } = parseShareUrl(raw)
  const label = PROVIDERS.find((p) => p.source === source)!.label

  let parsed: Parsed | null = null

  // Claude exposes a JSON snapshot endpoint; try it before scraping the page.
  if (source === "claude") {
    const id = url.pathname.split("/").filter(Boolean).pop()
    try {
      const api = await safeFetch(
        new URL(`https://claude.ai/api/chat_snapshots/${id}?rendering_mode=messages&render_all_tools=true`),
        "application/json"
      )
      if (api.ok) {
        const json = JSON.parse(await readText(api))
        const msgs = findMessages(json)
        if (msgs.length) {
          const title = typeof json?.snapshot_name === "string" ? json.snapshot_name : typeof json?.title === "string" ? json.title : ""
          parsed = toTranscript(title, msgs, label)
        }
      }
    } catch (e) {
      if (e instanceof ShareImportError && e.status === 413) throw e
      /* fall through to page scraping */
    }
  }

  if (!parsed) {
    const res = await safeFetch(url, "text/html,application/xhtml+xml")
    if (res.status === 404) throw new ShareImportError("This share link doesn't exist or was deleted.", 404)
    if (!res.ok) {
      throw new ShareImportError(`${label} blocked or rejected the request (HTTP ${res.status}).`, 502)
    }
    const html = await readText(res)
    parsed = source === "chatgpt" ? parseChatGPTShareHtml(html) : parseGenericHtml(html, label, TEXT_FALLBACK.has(source))
  }

  if (!parsed || parsed.content.trim().length < 20) {
    throw new ShareImportError(
      `Couldn't read any messages from that ${label} page. The link may be private or deleted, or ${label} may block automated access. You can paste the conversation manually instead.`,
      422
    )
  }
  return { ...parsed, occurredAt: parsed.occurredAt ?? null, source }
}

type Parsed = { title: string; content: string; messageCount: number; occurredAt?: number | null }
type Msg = { role: "user" | "assistant"; text: string }

function toTranscript(title: string, msgs: Msg[], label: string): Parsed {
  return {
    title: title.trim() || `Shared ${label} conversation`,
    content: msgs.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n\n"),
    messageCount: msgs.length,
  }
}

/* ── ChatGPT share HTML → transcript ── */

export function parseChatGPTShareHtml(html: string): Parsed | null {
  const re = /streamController\.enqueue\(("(?:[^"\\]|\\.)*")\)/g
  let match: RegExpExecArray | null
  while ((match = re.exec(html))) {
    let flat: unknown
    try {
      flat = JSON.parse(JSON.parse(match[1]))
    } catch {
      continue
    }
    if (!Array.isArray(flat)) continue
    const found = findChatGPTConversation(decodeTurboStream(flat))
    if (found) return found
  }
  return null
}

/** Decodes React Router's turbo-stream flat array into plain JS values. */
function decodeTurboStream(flat: unknown[]): unknown {
  const cache = new Map<number, unknown>()

  const decode = (idx: number): unknown => {
    if (idx < 0) return idx === -7 ? null : undefined
    if (cache.has(idx)) return cache.get(idx)
    const v = flat[idx]
    if (v === null || typeof v !== "object") {
      cache.set(idx, v)
      return v
    }
    if (Array.isArray(v)) {
      if (typeof v[0] === "string" && v.length <= 3 && /^[A-Z]$/.test(v[0])) {
        const out = v.length === 2 ? v[1] : v.slice(1)
        cache.set(idx, out)
        return out
      }
      const arr: unknown[] = []
      cache.set(idx, arr)
      for (const ref of v) arr.push(typeof ref === "number" ? decode(ref) : ref)
      return arr
    }
    const obj: Record<string, unknown> = {}
    cache.set(idx, obj)
    for (const [k, ref] of Object.entries(v as Record<string, unknown>)) {
      const m = /^_(\d+)$/.exec(k)
      if (!m) continue
      const key = decode(Number(m[1]))
      if (typeof key !== "string") continue
      obj[key] = typeof ref === "number" ? decode(ref) : ref
    }
    return obj
  }

  return decode(0)
}

/**
 * ChatGPT timestamps are epoch seconds. The share object's own create_time is
 * when the *link* was made, so prefer the earliest message time (when the chat
 * really started) and only fall back to the share times.
 */
function chatGPTTime(rec: Record<string, unknown>): number | null {
  const toMs = (v: unknown) => (typeof v === "number" && v > 0 ? Math.round(v * 1000) : null)
  const times = (rec.linear_conversation as { message?: { create_time?: unknown } }[])
    .map((n) => toMs(n?.message?.create_time))
    .filter((t): t is number => t !== null)
  if (times.length) return Math.min(...times)
  return toMs(rec.create_time) ?? toMs(rec.update_time)
}

interface ShareNode {
  message?: {
    author?: { role?: string }
    content?: { parts?: unknown[]; text?: string }
    metadata?: { is_visually_hidden_from_conversation?: boolean }
  }
}

function findChatGPTConversation(root: unknown): Parsed | null {
  const seen = new Set<unknown>()
  const stack: unknown[] = [root]
  while (stack.length) {
    const cur = stack.pop()
    if (!cur || typeof cur !== "object" || seen.has(cur)) continue
    seen.add(cur)

    const rec = cur as Record<string, unknown>
    if (Array.isArray(rec.linear_conversation) && rec.linear_conversation.length > 0) {
      const msgs: Msg[] = []
      for (const node of rec.linear_conversation as ShareNode[]) {
        const msg = node?.message
        if (!msg || msg.metadata?.is_visually_hidden_from_conversation) continue
        const role = msg.author?.role
        if (role !== "user" && role !== "assistant") continue
        const parts = msg.content?.parts
        const text = (
          Array.isArray(parts)
            ? parts.filter((p): p is string => typeof p === "string").join("\n")
            : (msg.content?.text ?? "")
        ).trim()
        if (text) msgs.push({ role, text })
      }
      const t = toTranscript(typeof rec.title === "string" ? rec.title : "", msgs, "ChatGPT")
      return { ...t, occurredAt: chatGPTTime(rec) }
    }
    for (const child of Array.isArray(cur) ? cur : Object.values(rec)) stack.push(child)
  }
  return null
}

/* ── Generic providers: embedded JSON messages, then visible text ── */

/** Providers whose share pages are server-rendered, so visible text is real content.
 *  Others (Claude, Gemini, …) ship an empty JS shell — scraping text would save junk. */
const TEXT_FALLBACK = new Set<ShareSource>(["perplexity"])

function parseGenericHtml(html: string, label: string, allowText: boolean): Parsed | null {
  const title = extractTitle(html)

  // 1. Embedded JSON blobs (Next.js data, JSON-LD, app state) that hold messages.
  const blobs = [...html.matchAll(/<script[^>]*(?:type="application\/(?:ld\+)?json"|id="__NEXT_DATA__")[^>]*>([\s\S]*?)<\/script>/gi)]
  for (const b of blobs) {
    try {
      const msgs = findMessages(JSON.parse(b[1]))
      if (msgs.length >= 2) return toTranscript(title, msgs, label)
    } catch {
      /* not JSON */
    }
  }

  // 2. Visible page text (works for server-rendered pages such as Perplexity).
  if (!allowText) return null
  const text = visibleText(html)
  if (text.length < 300) return null
  return { title: title || `Shared ${label} conversation`, content: text, messageCount: 1 }
}

const USER_ROLES = new Set(["user", "human", "you", "prompt", "query"])
const BOT_ROLES = new Set(["assistant", "model", "ai", "bot", "claude", "gemini", "response", "answer"])

/** Walks any JSON and returns the largest array that looks like a chat. */
function findMessages(root: unknown): Msg[] {
  let best: Msg[] = []
  const seen = new Set<unknown>()
  const stack: unknown[] = [root]
  while (stack.length) {
    const cur = stack.pop()
    if (!cur || typeof cur !== "object" || seen.has(cur)) continue
    seen.add(cur)
    if (Array.isArray(cur)) {
      const msgs = cur.map(asMessage).filter((m): m is Msg => m !== null)
      if (msgs.length >= 2 && msgs.length >= cur.length / 2 && msgs.length > best.length) best = msgs
    }
    for (const child of Array.isArray(cur) ? cur : Object.values(cur)) stack.push(child)
  }
  return best
}

function asMessage(node: unknown): Msg | null {
  if (!node || typeof node !== "object") return null
  const o = node as Record<string, unknown>
  const authorRole = (o.author as Record<string, unknown> | undefined)?.role
  const rawRole = [o.role, o.sender, authorRole, o.author, o.speaker].find((v) => typeof v === "string") as
    | string
    | undefined
  if (!rawRole) return null
  const r = rawRole.toLowerCase()
  const role = USER_ROLES.has(r) ? "user" : BOT_ROLES.has(r) ? "assistant" : null
  if (!role) return null
  const text = extractText(o.text ?? o.content ?? o.parts ?? o.message ?? o.markdown ?? o.answer).trim()
  return text ? { role, text } : null
}

function extractText(v: unknown): string {
  if (typeof v === "string") return v
  if (Array.isArray(v)) return v.map(extractText).filter(Boolean).join("\n")
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>
    if (typeof o.text === "string") return o.text
    if (o.parts) return extractText(o.parts)
    if (o.content) return extractText(o.content)
  }
  return ""
}

function extractTitle(html: string): string {
  const og = /<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i.exec(html)?.[1]
  const t = og ?? /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? ""
  return decodeEntities(t).replace(/\s+/g, " ").trim().slice(0, 100)
}

function visibleText(html: string): string {
  const body = html
    .replace(/<(script|style|noscript|svg|nav|header|footer|form|button)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr|br)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
  return decodeEntities(body)
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, 200_000)
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
}
