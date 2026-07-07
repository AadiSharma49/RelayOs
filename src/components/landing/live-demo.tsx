"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Icons } from "@/lib/icons"
import { AnimatedSection } from "./animated-section"

/**
 * Interactive "Try it" demo for the landing page.
 *
 * Runs fully client-side over a fixed set of sample decisions so any visitor
 * can feel the semantic-search "aha" in seconds — no signup, no backend, no API
 * cost, and it can never break. The matching is concept-based (synonym-aware)
 * so meaning-style queries land on the right decision even without keyword
 * overlap, mirroring what the real pgvector search does for a user's own data.
 */

interface SampleDecision {
  id: string
  title: string
  summary: string
  workspace: string
  concepts: string[]
}

// A fictional startup's decision history — varied enough that different
// queries surface clearly different results.
const SAMPLE_DECISIONS: SampleDecision[] = [
  {
    id: "d1",
    title: "Use PostgreSQL as our primary database",
    summary:
      "Chosen over MongoDB for relational integrity and strong querying. Neon gives us serverless Postgres with branching.",
    workspace: "Engineering",
    concepts: ["database"],
  },
  {
    id: "d2",
    title: "Handle authentication with Clerk",
    summary:
      "Clerk over rolling our own auth — gives us social login, sessions and user management out of the box so we ship faster.",
    workspace: "Engineering",
    concepts: ["auth"],
  },
  {
    id: "d3",
    title: "Launch with a freemium pricing model",
    summary:
      "Free tier to drive adoption, a $12/mo Pro tier for power users, and team plans later. Freemium beats a hard paywall for our top-of-funnel.",
    workspace: "Growth",
    concepts: ["pricing"],
  },
  {
    id: "d4",
    title: "Build the mobile app with React Native",
    summary:
      "React Native (Expo) so we share logic with the web app and ship iOS + Android from one codebase instead of two native teams.",
    workspace: "Product",
    concepts: ["mobile", "frontend"],
  },
  {
    id: "d5",
    title: "Deploy on Vercel",
    summary:
      "Vercel for zero-config Next.js hosting, preview deployments per PR, and edge performance. Keeps our infra overhead near zero.",
    workspace: "Engineering",
    concepts: ["hosting"],
  },
  {
    id: "d6",
    title: "Use Gemini for AI extraction",
    summary:
      "Google's Gemini model for extracting decisions and generating embeddings — good quality at low cost with a generous free tier.",
    workspace: "Engineering",
    concepts: ["ai"],
  },
  {
    id: "d7",
    title: "Adopt a violet + space-grotesk brand identity",
    summary:
      "Violet primary with a clean glassmorphism UI and Space Grotesk for headings — modern, distinct, and legible in light and dark.",
    workspace: "Design",
    concepts: ["design", "frontend"],
  },
]

// Concept → the words a visitor might use to ask about it.
const CONCEPT_SYNONYMS: Record<string, string[]> = {
  database: ["database", "db", "postgres", "postgresql", "sql", "storage", "data", "persistence", "mongo", "mongodb"],
  auth: ["auth", "authentication", "login", "signin", "sign-in", "clerk", "oauth", "session", "sessions", "security", "users", "accounts"],
  pricing: ["pricing", "price", "cost", "plan", "plans", "tier", "tiers", "subscription", "monetization", "monetize", "billing", "revenue", "freemium", "paywall", "money"],
  mobile: ["mobile", "app", "ios", "android", "native", "expo", "phone"],
  frontend: ["frontend", "framework", "next", "nextjs", "react", "ui", "web", "client"],
  hosting: ["hosting", "host", "deploy", "deployment", "infra", "infrastructure", "vercel", "cloud", "server", "serverless"],
  ai: ["ai", "model", "models", "llm", "gpt", "gemini", "claude", "extraction", "extract", "embeddings", "embedding", "ml"],
  design: ["design", "brand", "branding", "color", "colors", "colour", "logo", "identity", "ux", "font", "fonts", "typography", "look"],
}

const STOPWORDS = new Set([
  "the", "a", "an", "we", "our", "did", "do", "does", "why", "what", "how", "which",
  "is", "are", "to", "for", "of", "on", "in", "about", "pick", "picked", "choose",
  "chose", "use", "using", "used", "decide", "decided", "decision", "with", "and",
  "or", "should", "would", "was", "were", "have", "has", "get", "got",
])

interface Scored extends SampleDecision {
  score: number
}

function scoreDecision(query: string, d: SampleDecision): number {
  const q = query.toLowerCase()
  const words = q.split(/[^a-z0-9]+/).filter((w) => w && !STOPWORDS.has(w))
  if (words.length === 0) return 0

  // Which concepts does the query mention?
  const queryConcepts = new Set<string>()
  for (const [concept, syns] of Object.entries(CONCEPT_SYNONYMS)) {
    if (syns.some((s) => q.includes(s))) queryConcepts.add(concept)
  }

  let score = 0
  // Strong signal: concept overlap
  for (const c of d.concepts) if (queryConcepts.has(c)) score += 1

  // Softer signal: raw word appears in the decision text
  const haystack = `${d.title} ${d.summary}`.toLowerCase()
  for (const w of words) if (w.length > 2 && haystack.includes(w)) score += 0.35

  return score
}

// Map a raw score onto a believable, semantic-looking match percentage.
function toMatchPercent(score: number, top: number): number {
  if (score <= 0) return 0
  const ratio = top > 0 ? score / top : 0
  return Math.round(74 + ratio * 23) // 74%–97%
}

const SUGGESTIONS = [
  "why did we pick our database?",
  "how do we handle login?",
  "what did we decide about pricing?",
  "mobile app framework",
]

export function LiveDemo() {
  const [query, setQuery] = React.useState("")
  const [submitted, setSubmitted] = React.useState<string | null>(null)

  const results = React.useMemo<Scored[]>(() => {
    if (!submitted) return []
    const scored = SAMPLE_DECISIONS.map((d) => ({ ...d, score: scoreDecision(submitted, d) }))
      .filter((d) => d.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
    return scored
  }, [submitted])

  const topScore = results[0]?.score ?? 0

  const run = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setQuery(trimmed)
    setSubmitted(trimmed)
  }

  return (
    <section id="try-it" className="relative overflow-hidden py-24 sm:py-32">
      {/* soft glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Live demo — no signup
            </div>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Search decisions by <span className="text-primary">meaning</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              This is a sample team&apos;s decision history. Ask a question the way you&apos;d
              actually think it — the words don&apos;t have to match.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="mx-auto mt-10 max-w-2xl">
            {/* search box */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                run(query)
              }}
              className="flex items-center gap-2"
            >
              <div className="flex flex-1 items-center gap-2 rounded-xl border bg-card px-3.5 py-3 shadow-sm focus-within:border-primary/50">
                <Icons.search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. why did we pick our database?"
                  className="w-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-linear-to-r from-primary to-violet-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Search
              </button>
            </form>

            {/* suggestion chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => run(s)}
                  className="rounded-full border bg-card/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* results */}
            <div className="mt-6 space-y-2">
              <AnimatePresence mode="popLayout">
                {results.map((r, i) => (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className="rounded-xl border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium">{r.title}</p>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] text-primary">
                        {toMatchPercent(r.score, topScore)}% match
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>
                    <p className="mt-2 text-xs text-muted-foreground/70">{r.workspace}</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {submitted && results.length === 0 && (
                <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                  Nothing in this sample matched — try one of the suggestions above.
                </div>
              )}
            </div>

            {/* conversion nudge */}
            {submitted && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex flex-col items-center gap-3 rounded-xl border bg-card/50 p-5 text-center sm:flex-row sm:justify-between sm:text-left"
              >
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">That&apos;s your memory, searchable.</span>{" "}
                  Now do it with your own AI chats.
                </p>
                <Link
                  href="/sign-up"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-linear-to-r from-primary to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  Start free
                  <Icons.arrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
