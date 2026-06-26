# RelayOS — Architecture

## System Overview

RelayOS is a **Decision Intelligence Platform** built on Next.js 16 App Router with server components, Clerk authentication, PostgreSQL, and a provider-based AI abstraction layer.

---

## High-Level Architecture

```
┌─────────────────┐
│   Browser       │
│   (Next.js)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Clerk   │ ← Authentication / SSO
    └────┬────┘
         │
    ┌────┴────────────────┐
    │   Next.js API       │
    │   (Route Handlers)  │
    └────┬────────────────┘
         │
    ┌────┴────────────────────────┐
    │                             │
    ▼                             ▼
┌────────┐                  ┌──────────┐
│ Prisma │                  │ AI       │
│ ORM    │                  │ Provider │
│        │                  │ Registry │
└───┬────┘                  └────┬─────┘
    │                            │
    ▼                            ▼
┌─────────────┐          ┌──────────────┐
│ PostgreSQL  │          │ Google Gemini│
│   (Neon)    │          │ OpenRouter   │
└─────────────┘          └──────────────┘
```

---

## Authentication Flow

1. User visits landing page or protected route
2. Clerk middleware (`src/proxy.ts`) protects dashboard routes
3. On sign-in, Clerk creates session
4. `getOrCreateUser()` syncs PostgreSQL user on first authenticated request
5. All subsequent requests use `getCurrentUserId()` for ownership checks

```ts
// src/lib/api-utils.ts
const { userId: clerkId } = await auth()
let dbUser = await prisma.user.findUnique({ where: { clerkId } })
if (!dbUser) { /* create from currentUser() */ }
```

---

## AI Provider Architecture

### Interface

```ts
interface AIProvider {
  readonly name: ProviderName
  readonly model: string
  extractConversation(content: string): Promise<ExtractionResult>
  healthCheck(): Promise<ProviderHealth>
}
```

### Registry

```
src/lib/ai/providers/
├── provider.ts       # Interface + types
├── registry.ts       # Factory by AI_PROVIDER env var
├── gemini.ts         # Google Gemini
├── openrouter.ts     # OpenRouter
├── openai.ts         # Stub
├── anthropic.ts      # Stub
└── ollama.ts         # Stub
```

### Selection

```
AI_PROVIDER=gemini → GeminiProvider
AI_PROVIDER=openrouter → OpenRouterProvider
```

---

## Data Model

```prisma
User
  └── Workspace
       └── Conversation
            ├── Decision
            ├── ActionItem
            └── Question
```

- Every resource except User belongs to a Workspace
- Workspace belongs to a User (owner)
- Conversation may link to Decision/ActionItem/Question
- All queries scoped by `userId` via `getCurrentUserId()`

---

## API Organization

```
/api
├─ action-items/         # CRUD
├─ action-items/[id]     # Update / delete
├─ conversations/
│   ├─ search/           # Search conversations
│   └─ [id]/             # Get / update / delete
├─ decisions/
│   ├─ [id]/             # Update / delete
├─ extract/              # Trigger AI extraction
├─ questions/
│   └─ [id]/             # Update / delete
├─ search/               # Global search
├─ system/
│   ├─ ai/               # AI health check
│   └─ diagnostics/      # DB + table health
└─ workspaces/
   └─ [id]/              # Get workspace details
```

---

## Frontend Architecture

### Routing
- App Router with layout files
- Server components by default
- Client components marked with `"use client"`
- Protected dashboard layout at `src/app/dashboard/layout.tsx`

### State
- React useState / useEffect for local UI state
- No global state library (kept minimal)
- Server components fetch directly in async bodies

### UI
- shadcn/ui components in `src/components/ui/`
- Dashboard shell: sidebar + header + content
- Landing: hero, features, use cases, FAQ, footer

---

## Future Browser Extension Flow

```
Browser Extension
    │
    ▼ capture conversation
POST /api/conversations
    │
    ▼ trigger extraction
POST /api/extract
    │
    ▼ user reviews
RelayOS Web UI
    │
    ▼ stores
PostgreSQL
```

VS Code extension reuses the same backend APIs.