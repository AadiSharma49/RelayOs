# RelayOS — The Memory Layer for Human and AI Decisions

**Status:** Foundation Complete (~75%)  
**Stack:** Next.js 16 · TypeScript · Clerk · PostgreSQL · Prisma · Google Gemini  

---

## What is RelayOS?

RelayOS is a **Decision Intelligence Platform**.

It converts conversations into structured organizational memory.

Modern work happens inside AI assistants, Slack, Discord, meetings, and code editors. Those conversations disappear. RelayOS captures them, extracts knowledge, stores decisions, tracks action items, tracks unanswered questions, and makes them reusable later.

Future AI agents should query RelayOS before making decisions. RelayOS is becoming the **Memory Layer for AI Work**.

**Not:** ChatGPT clone · Note-taking app · Chatbot  
**Is:** Decision Memory System for Humans and AI

---

## Problem

Important decisions are made every day inside:
- ChatGPT
- Claude
- Cursor
- VS Code
- Slack
- Discord
- Meetings

After the conversation ends, the context is lost.

Teams rebuild the same context. Make the same decisions. Create the same action items.

There is no memory layer between conversation and execution.

---

## Solution

RelayOS sits between your conversations and your execution layer.

```
Conversation
    ↓
Capture
    ↓
AI Extraction
    ↓
Decision + Action Items + Questions
    ↓
Structured Memory
    ↓
Search + Reuse
    ↓
Future AI Agents query before deciding
```

One platform to remember every important decision.

---

## Core Flow

1. **Import** — Paste or sync conversations from any AI assistant or messaging platform
2. **Extract** — AI extracts decisions, action items, and questions automatically
3. **Review** — Approve, edit, or reject extracted items
4. **Store** — Everything saved with full context: who, why, when
5. **Recall** — Search decisions semantically across workspaces and time

---

## Architecture

### Frontend
- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Framer Motion

### Auth
- Clerk (production SSO)

### Database
- PostgreSQL (Neon)
- Prisma ORM

### AI
- Provider abstraction layer
- Google Gemini (default)
- OpenRouter (fallback)
- Extensible: OpenAI, Anthropic, Ollama

### Routes
- `/` — Landing page
- `/sign-in`, `/sign-up` — Clerk authentication
- `/dashboard` — Protected dashboard
- `/dashboard/workspaces/[id]` — Workspace management
- `/dashboard/system/ai-providers` — AI provider settings
- `/api/extract` — AI extraction endpoint
- `/api/system/ai` — AI health diagnostics

---

## Features

### Completed
-  Clerk authentication with automatic user sync
-  Multi-workspace system with ownership validation
-  Conversation import and viewer
-  AI extraction engine (provider-based)
-  Decision CRUD with status tracking
-  Action Items with priority
-  Questions tracking
-  Global search across all workspaces
-  Dashboard with system diagnostics
-  AI provider health monitoring
-  Multi-user data isolation

### In Progress
-  Browser Extension (planned)
-  VS Code integration (planned)
-  Memory Chat
-  Semantic search
-  Decision conflict detection

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Clerk |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| AI | Google Gemini / OpenRouter |
| Deployment | Vercel-ready |

---

## Project Structure

```
src/
├─ app/
│  ├─ api/                    # Backend API routes
│  │  ├─ action-items/
│  │  ├─ conversations/
│  │  ├─ decisions/
│  │  ├─ extract/             # AI extraction endpoint
│  │  ├─ questions/
│  │  ├─ search/              # Global search
│  │  ├─ system/
│  │  │  ├─ ai/               # AI health check
│  │  │  └─ diagnostics/      # System diagnostics
│  │  └─ workspaces/
│  ├─ dashboard/              # Protected dashboard
│  │  ├─ system/
│  │  │  └─ ai-providers/     # AI provider settings
│  │  └─ workspaces/[id]/     # Workspace + nested resources
│  ├─ layout.tsx
│  └─ page.tsx               # Landing page
├─ components/
│  ├─ dashboard/             # Dashboard shell, header, sidebar
│  ├─ landing/               # Hero, features, navbar, footer
│  └─ ui/                    # shadcn/ui components
├─ lib/
│  ├─ ai/
│  │  └─ providers/          # AI provider abstraction
│  │      ├─ provider.ts     # Common interface
│  │      ├─ gemini.ts       # Google Gemini
│  │      ├─ openrouter.ts   # OpenRouter
│  │      ├─ openai.ts       # Stub
│  │      ├─ anthropic.ts    # Stub
│  │      └─ ollama.ts       # Stub
│  ├─ api-utils.ts           # getOrCreateUser(), getCurrentUserId()
│  ├─ constants.ts           # App constants, nav config
│  ├─ prisma.ts              # Prisma client
│  └─ utils.ts               # Helper functions
└─ providers/
   ├─ auth-provider.tsx
   ├─ theme-provider.tsx
   └─ smooth-scroll-provider.tsx
```

---

## Installation

```bash
# Clone repository
git clone <repo-url>
cd relayos

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
npx prisma db push

# Run development server
npm run dev
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk public key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL for callbacks |
| `AI_PROVIDER` | Yes | `gemini`, `openrouter`, `openai`, `anthropic`, `ollama` |
| `AI_MODEL` | No | Model name (defaults by provider) |
| `GEMINI_API_KEY` | If Gemini | Google AI Studio key |
| `OPENROUTER_API_KEY` | If OpenRouter | OpenRouter key |

---

## Running Locally

1. Create `.env` from `.env.example`
2. Add Clerk keys from [clerk.com](https://clerk.com)
3. Add PostgreSQL URL (Neon recommended)
4. Run `npx prisma db push`
5. Run `npm run dev`
6. Open `http://localhost:3000`

---

## Future Roadmap

### Phase 1: Foundation 
- Auth, Database, Workspaces, Conversations, AI Extraction

### Phase 2: Intelligence 
- Semantic search
- Decision chat
- Memory consolidation

### Phase 3: Extensions 
- Browser Extension (Chrome/Firefox)
- VS Code extension
- Slack bot
- CLI tool

### Phase 4: Agents 
- Proactive decision suggestions
- Conflict detection
- Automated decision documentation
- Multi-agent orchestration

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with clear commit messages
4. Ensure `npm run build` passes
5. Submit a pull request

---

## License

Proprietary — RelayOS
