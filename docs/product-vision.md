# RelayOS — Product Vision

## Mission

Never lose an important decision again.

RelayOS is the **Memory Layer for Human and AI Decisions**.

---

## The Problem

Modern knowledge work has moved into:
- AI assistants (ChatGPT, Claude, Gemini, Cursor)
- Messaging platforms (Slack, Discord)
- Code editors (VS Code, GitHub Copilot)
- Meetings (Zoom, Google Meet)

These conversations are **ephemeral**. After the session ends, the context is gone.

Teams repeatedly:
- Rebuild the same context
- Re-make the same decisions
- Re-create the same action items
- Re-answer the same questions

There is no persistent memory layer between conversation and execution.

---

## The Solution

RelayOS sits between your conversations and your execution layer.

It captures conversations, extracts structured intelligence, stores it with full context, and makes it searchable and reusable.

Future AI agents will query RelayOS before making decisions, ensuring consistency with past choices.

---

## Target Users

### Primary
- **Engineering teams** — track architecture decisions, code review rationale, technical debt
- **Product teams** — maintain feature decision context, roadmap rationale
- **Leadership** — strategic context across meetings and discussions

### Secondary
- **Research teams** — organize hypotheses and conclusions from AI assistants
- **AI agents** — query decision memory before autonomous actions

---

## Core Value Propositions

1. **Never Lose Context** — Every decision is stored with full provenance
2. **AI-Powered Extraction** — Automatic decision identification from raw conversations
3. **Structured Memory** — Decisions, action items, questions are normalized and searchable
4. **Multi-Source** — Import from any AI tool or messaging platform
5. **Team Memory** — Workspace-based isolation with shared context

---

## User Journey

```
1. User signs up with Clerk
   ↓
2. User creates workspace
   ↓
3. User imports conversation (paste text)
   ↓
4. User clicks "Extract Intelligence"
   ↓
5. AI extracts decisions/actionItems/questions
   ↓
6. User reviews and approves items
   ↓
7. Items stored in PostgreSQL
   ↓
8. User searches across decisions
   ↓
9. Future AI agents query memory before deciding
```

---

## Future Vision

### Phase 1: Foundation (Current)
- Manual conversation import
- AI extraction with human review
- Basic decision storage and search

### Phase 2: Intelligence
- Semantic search across decisions
- Decision chat (query memory in natural language)
- Memory consolidation (merge related decisions)
- Conflict detection (contradictory decisions)

### Phase 3: Capture Automation
- Browser Extension (auto-capture from ChatGPT, Claude, etc.)
- VS Code extension (capture from coding context)
- Slack bot (capture from channels)
- Meeting recorder integration

### Phase 4: Agents
- Proactive decision suggestions
- Automated decision documentation
- Multi-agent orchestration with shared memory
- Decision prediction and impact analysis

---

## Competitive Landscape

| Competitor | Approach | RelayOS Advantage |
|------------|----------|-------------------|
| Notion | Manual note-taking | AI extraction, structured data |
| Obsidian | Personal knowledge base | Team workspaces, AI-native |
| ChatGPT | Conversational AI | Persistent memory, multi-source |
| Linear | Project management | Decision-focused, AI extraction |
| Mem | Knowledge management | Decision-first, AI agents ready |

---

## Success Metrics

- **Adoption** — Workspaces created per week
- **Engagement** — Conversations imported per workspace
- **Extraction accuracy** — User approval rate of AI extractions
- **Retention** — Weekly active users
- **Search usage** — Search queries per session

---

## Principles

1. **Memory is a first-class citizen** — not an afterthought
2. **AI serves humans** — extraction is reviewed, not auto-applied
3. **Privacy by design** — user data isolated, never shared
4. **Extensible architecture** — add providers and sources without core changes
5. **Production-ready from day one** — no demo code