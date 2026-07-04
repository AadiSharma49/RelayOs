"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"

interface Result {
  id: string
  title: string
  summary: string
  status: string
  workspaceId: string
  similarity: number
}

export default function SemanticSearchPage() {
  const [status, setStatus] = React.useState<{ total: number; embedded: number; remaining: number } | null>(null)
  const [indexing, setIndexing] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<Result[] | null>(null)
  const [searching, setSearching] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/embeddings/backfill")
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setStatus(data)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const buildIndex = async () => {
    setIndexing(true)
    setError(null)
    try {
      // Loop batches until nothing remains.
      for (let i = 0; i < 100; i++) {
        const res = await fetch("/api/embeddings/backfill", { method: "POST" })
        if (!res.ok) throw new Error("Indexing failed")
        const data = await res.json()
        setStatus((prev) =>
          prev ? { ...prev, embedded: prev.total - data.remaining, remaining: data.remaining } : prev
        )
        if (data.remaining === 0 || data.embedded === 0) break
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Indexing failed")
    } finally {
      setIndexing(false)
    }
  }

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim() || searching) return
    setSearching(true)
    setError(null)
    setResults(null)
    try {
      const res = await fetch("/api/search/semantic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Search failed")
      setResults(data.results || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed")
    } finally {
      setSearching(false)
    }
  }

  const needsIndexing = status && status.remaining > 0

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Semantic Search</h1>
        <p className="mt-1 text-muted-foreground">
          Search your decisions by <span className="text-foreground">meaning</span>, not just keywords.
        </p>
      </div>

      {/* Index status */}
      {status && (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Icons.zap className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium">
                {status.embedded} of {status.total} decisions indexed
              </p>
              {needsIndexing ? (
                <p className="text-muted-foreground">
                  {status.remaining} need embeddings before they&apos;re searchable.
                </p>
              ) : (
                <p className="text-muted-foreground">All decisions are searchable.</p>
              )}
            </div>
          </div>
          {needsIndexing && (
            <Button onClick={buildIndex} disabled={indexing} size="sm">
              {indexing ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.zap className="mr-2 h-4 w-4" />
              )}
              {indexing ? "Indexing…" : "Build search index"}
            </Button>
          )}
        </div>
      )}

      {/* Search box */}
      <form onSubmit={search} className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border bg-card px-3.5 py-2.5 focus-within:border-primary/50">
          <Icons.search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. why did we pick our database?"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <Button type="submit" disabled={!query.trim() || searching}>
          {searching ? <Icons.spinner className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {error && <p className="text-sm text-error">{error}</p>}

      {/* Results */}
      {results && (
        <div className="space-y-2">
          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
              No matching decisions. Try indexing first, or a different phrasing.
            </div>
          ) : (
            results.map((r) => (
              <Link key={r.id} href={`/dashboard/workspaces/${r.workspaceId}/decisions/${r.id}`}>
                <div className="rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{r.title}</p>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] text-primary">
                      {Math.round(r.similarity * 100)}% match
                    </span>
                  </div>
                  {r.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
