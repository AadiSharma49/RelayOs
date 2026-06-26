# RelayOS — Decision Intelligence Platform

RelayOS is a **Decision Intelligence Platform**. It captures, organizes, and explains decisions across projects so teams never lose context.

## What RelayOS IS

- **Decision Memory** — A persistent, searchable record of every decision made across your organization
- **Conversation Import** — Ingest conversations from ChatGPT, Claude, Gemini, Cursor, Notion, Discord
- **Decision Extraction** — AI identifies key decisions, action items, and rationale from unstructured text
- **Knowledge Graph** — Maps relationships between decisions across projects
- **Decision Search** — Natural language queries across your entire decision history

## What RelayOS is NOT

- **NOT** a ChatGPT clone
- **NOT** a note-taking app
- **NOT** an AI chatbot
- **NOT** a project management tool
- **NOT** a documentation wiki

## Core Flow

```
Conversation
  ↓
Decision Extraction  (AI identifies key decisions + rationale)
  ↓
Decision Memory  (persistent storage with status, confidence, metadata)
  ↓
Action Items  (tasks extracted from conversations)
  ↓
Questions  (open questions surfaced from discussions)
  ↓
Searchable Memory  (full-text + semantic search across all data)
```

## Data Model

Each Conversation feeds into multiple Decisions, Action Items, and Questions. All entities belong to a Workspace, and all Workspaces belong to a User. The entire graph is searchable and fully isolated per user.

## Key Concepts

- **Workspace** — A container for conversations, decisions, action items, and questions
- **Decision** — A recorded choice with title, summary, status (pending/accepted/rejected/deferred), and confidence score
- **Action Item** — A task extracted from a conversation that needs to be completed
- **Question** — An open question surfaced from a discussion
- **Memory** — The collective knowledge graph across all workspaces

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes, Prisma ORM |
| Database | PostgreSQL (Neon) |
| Auth | Clerk |
| Animation | Framer Motion |