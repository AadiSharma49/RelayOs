# RelayOS — API Reference

Base URL: `/api`

All endpoints require authentication except `/sign-in` and `/sign-up` (handled by Clerk).

---

## `/api/conversations`

**POST** — Create conversation

```json
{
  "workspaceId": "string",
  "title": "string",
  "content": "string",
  "source": "chatgpt" | "claude" | "gemini" | "cursor" | "slack" | "discord",
  "metadata": {}
}
```

Response: `201 Created`

---

## `/api/conversations/[id]`

**GET** — Get conversation  
**PATCH** — Update conversation  
**DELETE** — Delete conversation

Ownership enforced via `userId`.

---

## `/api/conversations/search`

**POST** — Search conversations

```json
{
  "query": "string",
  "workspaceId": "string?""
}
```

Response: matching conversations with highlighted snippets.

---

## `/api/decisions`

**POST** — Create decision

```json
{
  "workspaceId": "string",
  "conversationId": "string?",
  "title": "string",
  "summary": "string",
  "status": "pending | accepted | rejected | deferred",
  "confidence": 0.0
}
```

---

## `/api/decisions/[id]`

**PATCH** — Update decision  
**DELETE** — Delete decision

---

## `/api/action-items`

**POST** — Create action item

```json
{
  "workspaceId": "string",
  "conversationId": "string?",
  "decisionId": "string?",
  "title": "string",
  "description": "string",
  "priority": "low | medium | high"
}
```

---

## `/api/action-items/[id]`

**PATCH** — Update action item  
**DELETE** — Delete action item

---

## `/api/questions`

**POST** — Create question

```json
{
  "workspaceId": "string",
  "conversationId": "string?",
  "question": "string",
  "status": "open | answered | dismissed"
}
```

---

## `/api/questions/[id]`

**PATCH** — Update question  
**DELETE** — Delete question

---

## `/api/extract`

**POST** — Trigger AI extraction

```json
{
  "conversationId": "string"
}
```

Response:
```json
{
  "conversationId": "string",
  "workspaceId": "string",
  "workspaceName": "string",
  "conversationTitle": "string",
  "result": {
    "decisions": [],
    "actionItems": [],
    "questions": []
  }
}
```

Errors:
- `400` — missing `conversationId`
- `404` — conversation not found
- `500` — AI extraction failed

---

## `/api/search`

**POST** — Global search

```json
{
  "query": "string",
  "types": ["decisions", "actionItems", "questions"]
}
```

---

## `/api/system/ai`

**GET** — AI provider health check

Response:
```json
{
  "connected": true,
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "lastCheck": "2026-06-26T...",
  "available": true,
  "error": null
}
```

---

## `/api/system/diagnostics`

**GET** — System diagnostics

Response:
```json
{
  "database": { "status": "ok", "info": "Connected to PostgreSQL" },
  "tables": {
    "User": { "status": "ok" },
    "Workspace": { "status": "ok" },
    "Conversation": { "status": "ok" },
    "Decision": { "status": "ok" }
  },
  "timestamp": "2026-06-26T..."
}
```

---

## `/api/workspaces`

**POST** — Create workspace

```json
{
  "name": "string",
  "description": "string?"
}
```

---

## `/api/workspaces/[id]`

**GET** — Get workspace details  
**PATCH** — Update workspace  
**DELETE** — Delete workspace