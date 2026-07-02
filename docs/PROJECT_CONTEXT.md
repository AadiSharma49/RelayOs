# RelayOS — Full Project Context

> Paste this to any AI assistant to give it complete context on the project.

## 1. What RelayOS is
RelayOS is a **Decision Intelligence Platform** — a "memory layer" that turns AI
conversations into structured, searchable organizational memory. Engineers make
decisions inside Claude/ChatGPT/Cursor and lose them when the chat closes.
RelayOS captures those conversations, uses AI to extract **decisions, action
items, and questions**, stores them, and makes them searchable. It also has a
**Memory Chat** (RAG) that answers questions using only the stored data, with
citations.

## 2. Tech stack
- **Framework:** Next.js 16.2.9 (App Router) + React 19.2.4, TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui + Framer Motion; Lenis smooth scroll
- **Auth:** Clerk (`@clerk/nextjs` 7.5). Currently on DEV keys.
- **DB:** PostgreSQL (Neon) + Prisma ORM 5.22
- **AI:** Google Gemini (`gemini-2.5-flash`) via REST, behind a provider
  abstraction layer. OpenRouter/OpenAI/Anthropic/Ollama are stubs.
- **Deploy:** Vercel
- **Note:** This is a *modified* Next.js — middleware lives in `src/proxy.ts`
  (not `middleware.ts`), and it does NOT auto-inject some defaults; see AGENTS.md.

## 3. Data models (Prisma)
- **User** — clerkId, email, name, avatarUrl, **apiKey** (SHA-256 hash, for the
  browser extension)
- **Workspace** — belongs to User
- **Conversation** — title, content; belongs to Workspace + User
- **Decision** — title, summary, status (pending/accepted/rejected/deferred),
  confidence (0–1), source
- **ActionItem** — title, description, status, priority (low/medium/high)
- **Question** — question, status (open/resolved)
- **ChatMessage** — role, content, sources (JSON), for Memory Chat history

All child records carry `userId` + `workspaceId`; every query enforces
row-level ownership (`where: { id, userId }`).

## 4. Key routes
**App API:** `/api/workspaces`, `/api/conversations` (+ `[id]`, `search`),
`/api/decisions`, `/api/action-items`, `/api/questions`, `/api/search`,
`/api/extract` (AI extraction), `/api/system/ai` + `/api/system/diagnostics`.

**Memory Chat:** `/api/memory-chat` (RAG answer), `/history`, `/clear`,
`/suggestions` (dynamic starter questions from workspace data).

**Extension (API-key auth + CORS, public in middleware):**
`/api/user/api-key` (GET/POST, Clerk-authed — generates the key),
`/api/extension/workspaces` (GET), `/api/extension/import` (POST — creates
conversation + auto-extracts + saves).

**Pages:** `/` (landing), `/sign-in`, `/sign-up`, `/dashboard`,
`/dashboard/workspaces/[id]` (+ conversations/[id], decisions/[id], import,
memory-chat).

## 5. AI provider layer
`src/lib/ai/providers/` — `getProvider()` reads `AI_PROVIDER` (default `gemini`)
and returns an `AIProvider` implementing `extractConversation()` +
`healthCheck()`. Gemini calls use **retry-with-backoff** (`src/lib/ai/fetch-retry.ts`,
retries 429/500/502/503/504) and **JSON mode** (`responseMimeType:
"application/json"`, 8192 max tokens, 24k-char input cap) so responses are valid
JSON.

## 6. Browser extension (`/extension`, vanilla JS, MV3)
One-click capture of AI conversations into RelayOS. Files: `manifest.json`,
`content.js` (DOM scrapers for Claude/ChatGPT/Gemini + fallback), `popup.html`
/`popup.js`/`styles.css`, `background.js`, `icons/`.
- Auth: user pastes a `relay_sk_...` API key (v1). Key stored hashed server-side.
- Flow: popup lists workspaces → user clicks Capture → content script scrapes
  the conversation → POST `/api/extension/import` → conversation saved + AI
  extraction runs + items saved → popup shows "Found N decisions…".

## 7. What's built and working
Auth, workspace CRUD, conversation import (manual + extension), AI extraction
(decisions/action items/questions), review, global keyword search, Memory Chat
RAG with citations + dynamic starter questions + follow-up questions, chat
persistence, browser extension (capture → extract → save end-to-end).

## 8. Known issues / gotchas
- **Nothing from the latest work session is committed to git yet.**
- **Prisma native engine** can't regenerate while `npm run dev` holds the DLL
  (Windows EPERM). Restart the dev server after DB/schema changes.
- **Clerk multi-session:** having two Google accounts signed in caused workspaces
  to be created under one account but viewed under another → 404s. Fix: use ONE
  account; consider disabling multi-session in the Clerk dashboard.
- One legacy User row has a corrupt id (`"cuid"`) — harmless, from an early seed.
- **API key retrieval is manual** (visit `/api/user/api-key` or console POST) —
  no Settings UI yet.
- ~22 pre-existing ESLint errors (don't block the build in this Next.js).
- Landing page is a deliberately dark aesthetic (not fully light-mode capable).
- Extension DOM scrapers are fragile to Claude/ChatGPT/Gemini redesigns.
- Clerk is on DEV keys — needs production keys before real deployment.

## 9. Environment variables
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`,
`NEXT_PUBLIC_APP_URL`, `AI_PROVIDER=gemini`, `AI_MODEL=gemini-2.5-flash`,
`GEMINI_API_KEY`.

## 10. Run locally
`npm install` → `cp .env.example .env` (fill values) → `npx prisma db push` →
`npm run dev` → http://localhost:3000.

## 11. Suggested next steps
1. **Commit & push** all current work (repo cleanup, theme, responsiveness,
   extension, AI resilience, dynamic suggestions).
2. **Settings UI** to view/copy/regenerate the API key (remove manual step).
3. **Semantic search** (pgvector embeddings) — Phase 2 "Intelligence".
4. **Decision conflict detection.**
5. **Harden the extension** scrapers + optional background job for extraction.
6. **Production readiness:** Clerk production keys, remove debug `console.log`s,
   rate limiting, fix lint errors.
