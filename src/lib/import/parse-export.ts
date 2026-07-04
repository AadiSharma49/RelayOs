/**
 * Parses AI chat export files into RelayOS conversations.
 *
 * Supports:
 *  - ChatGPT: Settings → Data controls → Export → `conversations.json`
 *    (array of conversations, each with a `mapping` message tree)
 *  - Claude:  export `conversations.json`
 *    (array of conversations, each with a `chat_messages` array)
 *
 * Runs client-side so large exports never have to be uploaded whole.
 */

export type ExportSource = "chatgpt" | "claude"

export interface ParsedConversation {
  title: string
  content: string
  messageCount: number
  createdAt: number | null
  source: ExportSource
}

/* ── ChatGPT ── */

interface ChatGPTNode {
  message?: {
    author?: { role?: string }
    content?: { parts?: unknown[] }
    create_time?: number
  }
  parent?: string | null
}

function reconstructChatGPT(conv: {
  title?: string
  create_time?: number
  mapping?: Record<string, ChatGPTNode>
  current_node?: string
}): ParsedConversation | null {
  const mapping = conv.mapping
  if (!mapping) return null

  // Walk from the active leaf up the parent chain, then reverse to chronological.
  const chain: NonNullable<ChatGPTNode["message"]>[] = []
  let nodeId: string | null | undefined = conv.current_node
  const guard = new Set<string>()
  while (nodeId && mapping[nodeId] && !guard.has(nodeId)) {
    guard.add(nodeId)
    const node: ChatGPTNode = mapping[nodeId]
    if (node.message) chain.push(node.message)
    nodeId = node.parent ?? undefined
  }
  chain.reverse()

  const lines: string[] = []
  for (const msg of chain) {
    const role = msg.author?.role
    if (role !== "user" && role !== "assistant") continue
    const parts = msg.content?.parts
    if (!Array.isArray(parts)) continue
    const text = parts
      .filter((p): p is string => typeof p === "string")
      .join("\n")
      .trim()
    if (!text) continue
    lines.push(`${role === "user" ? "Human" : "Assistant"}: ${text}`)
  }

  if (lines.length === 0) return null
  return {
    title: (conv.title || "Untitled ChatGPT conversation").trim(),
    content: lines.join("\n\n"),
    messageCount: lines.length,
    createdAt: conv.create_time ? Math.round(conv.create_time * 1000) : null,
    source: "chatgpt",
  }
}

/* ── Claude ── */

interface ClaudeMessage {
  sender?: string
  text?: string
  content?: Array<{ type?: string; text?: string }>
}

function reconstructClaude(conv: {
  name?: string
  created_at?: string
  chat_messages?: ClaudeMessage[]
}): ParsedConversation | null {
  const msgs = conv.chat_messages
  if (!Array.isArray(msgs)) return null

  const lines: string[] = []
  for (const m of msgs) {
    let text = ""
    if (typeof m.text === "string" && m.text.trim()) {
      text = m.text.trim()
    } else if (Array.isArray(m.content)) {
      text = m.content
        .filter((c) => c.type === "text" && typeof c.text === "string")
        .map((c) => c.text)
        .join("\n")
        .trim()
    }
    if (!text) continue
    lines.push(`${m.sender === "human" ? "Human" : "Assistant"}: ${text}`)
  }

  if (lines.length === 0) return null
  const created = conv.created_at ? Date.parse(conv.created_at) : NaN
  return {
    title: (conv.name || "Untitled Claude conversation").trim(),
    content: lines.join("\n\n"),
    messageCount: lines.length,
    createdAt: Number.isFinite(created) ? created : null,
    source: "claude",
  }
}

/* ── Entry point ── */

export interface ParseResult {
  source: ExportSource | null
  conversations: ParsedConversation[]
}

export function parseExport(raw: unknown): ParseResult {
  let data = raw
  // Some exports wrap the array in an object.
  if (data && !Array.isArray(data) && typeof data === "object") {
    const maybe = (data as { conversations?: unknown }).conversations
    if (Array.isArray(maybe)) data = maybe
  }
  if (!Array.isArray(data) || data.length === 0) {
    return { source: null, conversations: [] }
  }

  const first = data[0] as Record<string, unknown>
  const isChatGPT = first?.mapping !== undefined
  const isClaude = first?.chat_messages !== undefined
  const source: ExportSource | null = isChatGPT ? "chatgpt" : isClaude ? "claude" : null
  if (!source) return { source: null, conversations: [] }

  const conversations: ParsedConversation[] = []
  for (const item of data) {
    try {
      const parsed = source === "chatgpt" ? reconstructChatGPT(item) : reconstructClaude(item)
      if (parsed) conversations.push(parsed)
    } catch {
      // Skip malformed conversations, keep importing the rest.
    }
  }

  // Newest first.
  conversations.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
  return { source, conversations }
}
