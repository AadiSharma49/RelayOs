# Contributing to RelayOS

Thanks for working on RelayOS. This guide explains how the project is laid out,
how to get it running, and the conventions we follow so the codebase stays clean
and predictable for everyone.

---

## Prerequisites

- **Node.js** 20+
- **PostgreSQL** database (we use [Neon](https://neon.tech))
- A **Clerk** account for auth ([clerk.com](https://clerk.com))
- A **Google Gemini** API key ([Google AI Studio](https://aistudio.google.com))

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file from the template
cp .env.example .env
#    then fill in every value (see the table below)

# 3. Push the Prisma schema to your database
npx prisma db push

# 4. Start the dev server
npm run dev
```

Open http://localhost:3000.

### Environment variables

Every key in `.env.example` must be set. The important ones:

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk public key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` in dev |
| `AI_PROVIDER` | Yes | Defaults to `gemini` |
| `GEMINI_API_KEY` | Yes (for Gemini) | From Google AI Studio |

> **Never commit `.env`.** Only `.env.example` (with empty values) belongs in git.

---

## ⚠️ Important: this is a modified Next.js

This repo pins a version of Next.js that has **breaking changes** from what you may
know. Before writing framework-level code (routing, data fetching, config), read the
relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices. See
[`AGENTS.md`](./AGENTS.md).

---

## Project Structure

```
src/
├─ app/                      # Next.js App Router
│  ├─ api/                   # Backend route handlers (one folder per resource)
│  │  ├─ workspaces/         #   CRUD + [workspaceId] dynamic routes
│  │  ├─ conversations/      #   Import, view, search
│  │  ├─ decisions/          #   Decision CRUD
│  │  ├─ action-items/       #   Action item CRUD
│  │  ├─ questions/          #   Question CRUD
│  │  ├─ extract/            #   AI extraction endpoint
│  │  ├─ memory-chat/        #   RAG chat over stored memory
│  │  ├─ search/             #   Global keyword search
│  │  └─ system/             #   AI health + diagnostics
│  ├─ dashboard/             # Protected app UI
│  ├─ sign-in/ · sign-up/    # Clerk auth pages
│  └─ page.tsx               # Landing page
├─ components/
│  ├─ dashboard/             # App shell, header, sidebar, search dialog
│  ├─ landing/               # Marketing sections
│  ├─ loading/               # Loading/skeleton primitives
│  └─ ui/                    # shadcn/ui components
├─ lib/
│  ├─ ai/providers/          # AI provider abstraction (see below)
│  ├─ api-utils.ts           # getOrCreateUser(), getCurrentUserId()
│  ├─ constants.ts           # App constants + nav config
│  ├─ prisma.ts              # Prisma client singleton
│  └─ utils.ts               # Shared helpers (cn, etc.)
└─ providers/                # React context providers (auth, theme, scroll)
```

### AI provider layer

All AI access goes through `src/lib/ai/providers/`. `getProvider()` in
`registry.ts` reads `AI_PROVIDER` and returns an implementation of the
`AIProvider` interface (`provider.ts`). Gemini is the default and only fully
implemented provider; `openai`, `anthropic`, and `ollama` are stubs. **Add new
providers by implementing `AIProvider` and wiring them into the registry** —
never call an AI API directly from a route handler.

---

## Conventions

- **Language:** TypeScript everywhere. No `any` unless truly unavoidable.
- **Formatting:** Prettier config in `.prettierrc` (no semicolons, double quotes,
  100-col width). Run your editor's format-on-save.
- **API routes:** Every handler validates Clerk auth and enforces **row-level
  ownership** (`where: { id, userId }`) before touching data. Never trust an ID
  from the client without an ownership check.
- **Errors:** Return JSON `{ error: "..." }` with an appropriate status code.
  Log server-side with a `[context]` prefix; never leak stack traces to clients.
- **Database:** Change the schema in `prisma/schema.prisma`, then run
  `npx prisma db push` (dev). Regenerate the client with `npx prisma generate`.

---

## Before You Open a Pull Request

1. `npm run lint` — no errors.
2. `npm run build` — must pass (it runs `prisma generate` first).
3. Keep PRs focused; write a clear description of **what** changed and **why**.
4. Update `README.md` / docs if you changed behavior or setup.

---

## Branching & Commits

- Branch off `main`: `feature/<short-name>` or `fix/<short-name>`.
- Use clear, imperative commit messages (`feat: add semantic search`,
  `fix: enforce workspace ownership on decisions`).
- Squash noisy WIP commits before requesting review.
