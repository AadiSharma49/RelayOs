# RelayOS — System Design

## Overview

RelayOS is designed as a **memory-first** architecture. Every decision, action item, and question captured from conversations becomes a first-class record in PostgreSQL, searchable and auditable.

---

## Core Principles

1. **Ownership is mandatory** — every query is scoped by `userId`
2. **Provider abstraction** — AI logic never hardcodes a vendor
3. **Server first** — API routes own business logic; client owns UI
4. **No secrets in code** — all credentials come from environment variables
5. **Extensible** — add providers, sources, and exporters without changing core flow

---

## Key Flows

### 1. Extraction Flow

```
User clicks "Extract Intelligence"
    ↓
POST /api/extract { conversationId }
    ↓
getCurrentUserId() // enforce ownership
    ↓
prisma.conversation.findFirst({ where: { id, userId } })
    ↓
getProvider().extractConversation(content)
    ↓
AI returns JSON
    ↓
Store decisions/actionItems/questions in DB (manual review step first)
    ↓
Return result to client for review
```

### 2. Workspace Isolation

- Each workspace belongs to exactly one `User`
- All workspace queries include `userId`
- Route params are validated server-side
- Direct URL access to another user’s workspace returns 404

### 3. Auth Sync

- Clerk session available via `auth()` and `currentUser()`
- First call to `getOrCreateUser()` creates PostgreSQL record
- Subsequent calls reuse existing record by `clerkId`

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Provider registry vs direct SDK calls | Swap AI vendors without touching routes |
| Server components for pages | Faster TTFB, simpler data fetching |
| Client components only where needed | Minimize JS bundle |
| Single AI_MODEL env | One knob controls provider model |
| Prisma over raw SQL | Type safety and migrations |