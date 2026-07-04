#!/usr/bin/env node
/**
 * RelayOS MCP Server
 * ------------------
 * Exposes your RelayOS decision memory to any MCP client (Claude Desktop,
 * Cursor, Windsurf, …) so your AI assistant can search and read the decisions,
 * action items and open questions you've captured — live, while you work.
 *
 * Zero dependencies: speaks the MCP stdio protocol (newline-delimited
 * JSON-RPC 2.0) directly using only Node built-ins + global `fetch`.
 * Requires Node 18+.
 *
 * Configuration (environment variables):
 *   RELAYOS_API_KEY   required — a personal key from RelayOS → Settings → API Key
 *   RELAYOS_URL       optional — base URL of your RelayOS instance
 *                     (default: http://localhost:3000)
 *
 * IMPORTANT: never write anything to stdout except protocol messages.
 * All diagnostics go to stderr.
 */

import { createInterface } from "node:readline"

const PROTOCOL_VERSION = "2024-11-05"
const SERVER_INFO = { name: "relayos", version: "0.1.0" }

const BASE_URL = (process.env.RELAYOS_URL || "http://localhost:3000").replace(/\/+$/, "")
const API_KEY = process.env.RELAYOS_API_KEY || ""

function log(...args) {
  // stderr only — stdout is reserved for the JSON-RPC stream.
  process.stderr.write("[relayos-mcp] " + args.join(" ") + "\n")
}

/* ── RelayOS HTTP client ───────────────────────────────────────────────── */

async function relay(path, { method = "GET", query, body } = {}) {
  if (!API_KEY) {
    throw new Error("RELAYOS_API_KEY is not set. Add it to your MCP client config.")
  }
  const url = new URL(BASE_URL + path)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v))
    }
  }
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { raw: text }
  }

  if (!res.ok) {
    const msg = data?.error || `RelayOS request failed (${res.status})`
    if (res.status === 401) {
      throw new Error(
        `${msg}. Check RELAYOS_API_KEY — generate one in RelayOS → Settings → API Key.`
      )
    }
    throw new Error(msg)
  }
  return data
}

/* ── Tool definitions ──────────────────────────────────────────────────── */

const TOOLS = [
  {
    name: "search_decisions",
    description:
      "Semantically search the user's captured decisions by meaning (not just keywords). " +
      "Use this to answer questions like 'why did we choose our database?' or 'what did we decide about auth?'.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural-language search query." },
        workspaceId: { type: "string", description: "Optional: restrict to one workspace." },
        limit: { type: "number", description: "Max results (default 10, max 50)." },
      },
      required: ["query"],
    },
    handler: async (a) => {
      const data = await relay("/api/mcp/search", {
        method: "POST",
        body: { query: a.query, workspaceId: a.workspaceId, limit: a.limit },
      })
      const results = data.results || []
      if (results.length === 0) return "No matching decisions found."
      return results
        .map(
          (r, i) =>
            `${i + 1}. ${r.title}  (${Math.round((r.similarity ?? 0) * 100)}% match, status: ${r.status})\n` +
            `   ${r.summary || ""}`
        )
        .join("\n\n")
    },
  },
  {
    name: "list_decisions",
    description:
      "List the user's most recent decisions, newest first. Optionally filter by workspace or status.",
    inputSchema: {
      type: "object",
      properties: {
        workspaceId: { type: "string", description: "Optional workspace filter." },
        status: { type: "string", description: "Optional status filter (e.g. pending, accepted)." },
        limit: { type: "number", description: "Max results (default 20, max 100)." },
      },
    },
    handler: async (a) => {
      const data = await relay("/api/mcp/decisions", {
        query: { workspaceId: a.workspaceId, status: a.status, limit: a.limit },
      })
      const items = data.decisions || []
      if (items.length === 0) return "No decisions found."
      return items
        .map(
          (d) =>
            `• ${d.title}  [${d.status}] — ${d.workspace}\n  ${d.summary || ""}`
        )
        .join("\n\n")
    },
  },
  {
    name: "list_action_items",
    description:
      "List the user's action items (to-dos). Defaults to outstanding (pending) items; pass status='all' to include completed ones.",
    inputSchema: {
      type: "object",
      properties: {
        workspaceId: { type: "string", description: "Optional workspace filter." },
        status: { type: "string", description: "'pending' (default), a specific status, or 'all'." },
        limit: { type: "number", description: "Max results (default 20, max 100)." },
      },
    },
    handler: async (a) => {
      const data = await relay("/api/mcp/action-items", {
        query: { workspaceId: a.workspaceId, status: a.status, limit: a.limit },
      })
      const items = data.actionItems || []
      if (items.length === 0) return "No action items found."
      return items
        .map(
          (it) =>
            `☐ ${it.title}  [${it.priority} priority, ${it.status}] — ${it.workspace}` +
            (it.description ? `\n  ${it.description}` : "")
        )
        .join("\n\n")
    },
  },
  {
    name: "list_open_questions",
    description:
      "List the user's open questions — things still undecided or needing follow-up. Pass status='all' to include resolved ones.",
    inputSchema: {
      type: "object",
      properties: {
        workspaceId: { type: "string", description: "Optional workspace filter." },
        status: { type: "string", description: "'open' (default) or 'all'." },
        limit: { type: "number", description: "Max results (default 20, max 100)." },
      },
    },
    handler: async (a) => {
      const data = await relay("/api/mcp/questions", {
        query: { workspaceId: a.workspaceId, status: a.status, limit: a.limit },
      })
      const items = data.questions || []
      if (items.length === 0) return "No open questions found."
      return items.map((q) => `? ${q.question}  [${q.status}] — ${q.workspace}`).join("\n")
    },
  },
  {
    name: "list_workspaces",
    description:
      "List the user's RelayOS workspaces with item counts, so you can scope other tools to a specific workspace by id.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => {
      const data = await relay("/api/mcp/workspaces")
      const items = data.workspaces || []
      if (items.length === 0) return "No workspaces found."
      return items
        .map(
          (w) =>
            `• ${w.name}  (id: ${w.id})\n  ${w.decisions} decisions, ${w.actionItems} action items, ${w.questions} questions`
        )
        .join("\n\n")
    },
  },
]

const TOOL_BY_NAME = new Map(TOOLS.map((t) => [t.name, t]))

/* ── JSON-RPC plumbing ─────────────────────────────────────────────────── */

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n")
}

function sendResult(id, result) {
  send({ jsonrpc: "2.0", id, result })
}

function sendError(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } })
}

async function handleMessage(msg) {
  const { id, method, params } = msg

  // Notifications (no id) never get a response.
  const isNotification = id === undefined || id === null

  switch (method) {
    case "initialize":
      sendResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      })
      return

    case "notifications/initialized":
    case "notifications/cancelled":
      return // no response for notifications

    case "ping":
      if (!isNotification) sendResult(id, {})
      return

    case "tools/list":
      sendResult(id, {
        tools: TOOLS.map(({ name, description, inputSchema }) => ({
          name,
          description,
          inputSchema,
        })),
      })
      return

    case "tools/call": {
      const name = params?.name
      const args = params?.arguments || {}
      const tool = TOOL_BY_NAME.get(name)
      if (!tool) {
        sendError(id, -32602, `Unknown tool: ${name}`)
        return
      }
      try {
        const text = await tool.handler(args)
        sendResult(id, { content: [{ type: "text", text: String(text) }] })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        log("tool error:", name, message)
        // Report as a tool error result so the model can see + recover.
        sendResult(id, {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        })
      }
      return
    }

    default:
      if (!isNotification) sendError(id, -32601, `Method not found: ${method}`)
      return
  }
}

/* ── stdio loop ────────────────────────────────────────────────────────── */

const rl = createInterface({ input: process.stdin })

rl.on("line", (line) => {
  const trimmed = line.trim()
  if (!trimmed) return
  let msg
  try {
    msg = JSON.parse(trimmed)
  } catch {
    log("failed to parse line:", trimmed.slice(0, 120))
    return
  }
  handleMessage(msg).catch((err) => log("handler crash:", err?.message || String(err)))
})

rl.on("close", () => process.exit(0))

log(`ready — talking to ${BASE_URL}${API_KEY ? "" : " (WARNING: RELAYOS_API_KEY not set)"}`)
