# RelayOS — Repository Audit

**Date:** 2026-06-26  
**Purpose:** Staff-level engineering audit before browser extension development  

---

## Current Completion

**~75% — Foundation Complete**

- ✅ Authentication (Clerk)
- ✅ Database / Prisma schema
- ✅ Workspace system with ownership
- ✅ Conversation import & viewer
- ✅ AI extraction engine (provider-based)
- ✅ Gemini provider implementation
- ✅ Decision / ActionItem / Question CRUD
- ✅ Global search
- ✅ Dashboard
- ✅ Multi-user isolation
- ✅ Protected routes
- ⬜ Browser Extension
- ⬜ VS Code extension
- ⬜ Memory search / semantic search
- ⬜ Decision chat

---

## Systems

### Completed
- Clerk auth with `getOrCreateUser()` sync
- PostgreSQL via Prisma
- Workspace + nested resources
- AI provider registry + health checks
- `/api/extract` extraction pipeline
- Protected dashboard routes

### Incomplete
- AI providers: OpenAI, Anthropic, Ollama (stubs only)
- Memory/decision chat
- Semantic search
- Conflict detection
- Email notifications
- Team sharing

---

## Technical Debt

1. **Auth imports:** `useSignOut` was used incorrectly in older commits. Now fixed to `useClerk().signOut()`.
2. **API error leakage:** Some extraction error paths previously exposed raw provider text. Current `/api/extract` returns generic failure.
3. **Client/server splits:** Several helper functions in server pages would be better moved to dedicated `src/lib/` modules.
4. **Duplicate markdown:** Landing sections in client components are verbose and could be data-driven.
5. **Dead imports:** Remove `SiVscode` etc. if client imports drift again.

---

## Unused / Dead Code Risk

- `src/lib/db-check.ts` and `src/lib/db-health.ts` appear duplicated or unused by main app routes.
- `src/components/landing/index.ts` may be unused if pages import components directly.

---

## Scalability Risks

- Extraction executes synchronously in API route; long conversations may hit 60s timeout.
- No request queue for AI calls.
- No caching layer.
- No rate limiting on protected routes beyond Clerk.
- Global `console.log` statements may leak PII in logs at scale.

---

## Before Browser Extension

Must-have:
1. Stable auth + session handling (done)
2. Stable AI provider abstraction (done)
3. CI/CD pipeline
4. Structured logging + error reporting (e.g., Sentry)
5. API key rotation support

Recommended:
1. Background job queue for extraction
2. Webhook support for external systems
3. Export backups
4. Audit log for decision changes