# Browser Extension Architecture Plan

## Purpose

The RelayOS Browser Extension captures conversations from AI assistants and messaging platforms, then syncs them to RelayOS for extraction and memory storage.

---

## Supported Platforms

- **ChatGPT** — chat.openai.com
- **Claude** — claude.ai
- **Gemini** — gemini.google.com
- **Cursor** — cursor.sh
- **VS Code** — via separate extension reusing same backend

---

## Authentication

1. User logs into RelayOS web app with Clerk
2. RelayOS issues JWT session cookie
3. Extension stores no credentials
4. Extension calls RelayOS APIs with session cookie from browser context

```ts
// Extension calls RelayOS with existing cookies
fetch("https://relayos.com/api/conversations", {
  method: "POST",
  credentials: "include",
  body: JSON.stringify({ content, source: "chatgpt" }),
})
```

---

## Conversation Capture

### ChatGPT
- Observe DOM mutations on new messages
- Extract user + assistant message pairs
- Debounce capture to avoid duplicate API calls
- Add floating “Save to RelayOS” button

### Claude
- Similar DOM observation
- Capture thread structure

### Gemini
- Capture chat bubbles

### Cursor
- Capture IDE chat panel content

---

## Sync Flow

```
Conversation detected
    ↓
User clicks "Save to RelayOS" OR auto-sync
    ↓
POST /api/conversations { content, source, metadata }
    ↓
RelayOS creates Conversation record
    ↓
User can trigger extraction from web UI
    ↓
POST /api/extract { conversationId }
    ↓
AI extracts decisions/actionItems/questions
```

---

## Extension UI

- Popup with:
  - Connection status
  - Last synced timestamp
  - Quick capture button
  - Settings (default source, auto-sync)

---

## Notification Model

- Badge count on extension icon = unsynced conversations
- Click opens popup
- Optional desktop notification after sync

---

## VS Code Extension

- Reuses same `/api/conversations` and `/api/extract` endpoints
- Adds inline command: “RelayOS: Capture this conversation”
- Captures from VS Code chat, Copilot, or terminal context

---

## Security

- No API keys in extension
- Extension only talks to RelayOS origin
- All auth via Clerk session cookies
- CSRF protection on all API endpoints

---

## Implementation Notes

- Manifest V3
- React for popup UI
- Background service worker for DOM observation
- Storage API for user preferences