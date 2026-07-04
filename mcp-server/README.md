# RelayOS MCP Server

Give your AI assistant (Claude Desktop, Cursor, Windsurf, …) live access to the
decisions, action items and open questions you've captured in **RelayOS** — via
the [Model Context Protocol](https://modelcontextprotocol.io).

Ask Claude *"why did we pick our database?"* and it will search your real
decision history and answer from it.

## Tools it exposes

| Tool | What it does |
| --- | --- |
| `search_decisions` | Semantic search over your decisions (by meaning, not keywords) |
| `list_decisions` | Recent decisions, optionally filtered by workspace / status |
| `list_action_items` | Your to-dos (pending by default) |
| `list_open_questions` | Things still undecided |
| `list_workspaces` | Your workspaces + item counts (to scope the tools above) |

## Requirements

- **Node 18+** (uses the built-in `fetch` — no `npm install` needed, zero deps)
- A running RelayOS instance (local `http://localhost:3000` or your deployment)
- A **RelayOS API key**: open RelayOS → **Settings → API Key** → *Generate*, and
  copy it (shown once).

## Setup — Claude Desktop

Edit your Claude Desktop config:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add a `relayos` entry (use the **absolute path** to `index.mjs`):

```json
{
  "mcpServers": {
    "relayos": {
      "command": "node",
      "args": ["D:\\RelayOS\\mcp-server\\index.mjs"],
      "env": {
        "RELAYOS_API_KEY": "relay_sk_your_key_here",
        "RELAYOS_URL": "http://localhost:3000"
      }
    }
  }
}
```

Restart Claude Desktop. You should see the RelayOS tools appear (the 🔌/tools
icon). Try: *"Search my RelayOS decisions for how we handle auth."*

## Setup — Cursor

`Settings → MCP → Add new server` (or edit `~/.cursor/mcp.json`) with the same
shape as above.

## Configuration

| Env var | Required | Default | Notes |
| --- | --- | --- | --- |
| `RELAYOS_API_KEY` | ✅ | — | Personal key from RelayOS → Settings → API Key |
| `RELAYOS_URL` | — | `http://localhost:3000` | Base URL of your RelayOS instance |

## Test it standalone

You can drive it by hand to confirm it works before wiring up a client:

```bash
RELAYOS_API_KEY=relay_sk_xxx node mcp-server/index.mjs
```

Then paste a line and press Enter:

```json
{"jsonrpc":"2.0","id":1,"method":"tools/list"}
```

It should print a JSON line listing the five tools. (On success, diagnostics go
to **stderr**; only protocol JSON goes to stdout.)

## Troubleshooting

- **"RELAYOS_API_KEY is not set"** — add it to the `env` block in your config.
- **401 / "Invalid or missing API key"** — the key is wrong or was regenerated;
  make a new one in Settings → API Key and update the config.
- **Connection refused** — RelayOS isn't running, or `RELAYOS_URL` is wrong.
- **No search results** — build the search index first: RelayOS →
  `/dashboard/search` → **Build search index**.
