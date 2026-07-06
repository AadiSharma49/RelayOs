"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"

type Severity = "high" | "medium" | "low"

interface ConflictResult {
  reason: string
  severity: Severity
  similarity: number
  workspaceId: string
  workspaceName: string
  a: { id: string; title: string; summary: string }
  b: { id: string; title: string; summary: string }
}

const SEVERITY_STYLES: Record<Severity, { label: string; badge: string; ring: string }> = {
  high: {
    label: "High",
    badge: "bg-error/10 text-error",
    ring: "border-error/30",
  },
  medium: {
    label: "Medium",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ring: "border-amber-500/30",
  },
  low: {
    label: "Low",
    badge: "bg-muted text-muted-foreground",
    ring: "border-border",
  },
}

export default function ConflictsPage() {
  const [status, setStatus] = React.useState<{ total: number; embedded: number; remaining: number } | null>(null)
  const [indexing, setIndexing] = React.useState(false)
  const [scanning, setScanning] = React.useState(false)
  const [scanned, setScanned] = React.useState(false)
  const [conflicts, setConflicts] = React.useState<ConflictResult[]>([])
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

  const scan = async () => {
    setScanning(true)
    setError(null)
    try {
      const res = await fetch("/api/conflicts/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Scan failed")
      setConflicts(data.conflicts || [])
      setScanned(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed")
    } finally {
      setScanning(false)
    }
  }

  const needsIndexing = status && status.remaining > 0
  const notEnough = status && status.embedded < 2

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Conflict Detection</h1>
        <p className="mt-1 text-muted-foreground">
          Find decisions that <span className="text-foreground">contradict</span> each other — before they cost you.
        </p>
      </div>

      {/* Index status / not-enough notice */}
      {needsIndexing && (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Icons.zap className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium">
                {status!.embedded} of {status!.total} decisions indexed
              </p>
              <p className="text-muted-foreground">
                Conflict detection needs embeddings. Build the index first.
              </p>
            </div>
          </div>
          <Button onClick={buildIndex} disabled={indexing} size="sm">
            {indexing ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.zap className="mr-2 h-4 w-4" />
            )}
            {indexing ? "Indexing…" : "Build search index"}
          </Button>
        </div>
      )}

      {/* Scan control */}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icons.gitBranch className="h-4 w-4 text-primary" />
          </div>
          <div className="text-sm text-muted-foreground">
            RelayOS compares decisions within each workspace and uses AI to flag genuine
            contradictions — reversals, incompatible choices, or changed direction.
          </div>
        </div>
        <Button onClick={scan} disabled={scanning || indexing || !!needsIndexing || !!notEnough} className="w-full sm:w-auto">
          {scanning ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Scanning your decisions…
            </>
          ) : (
            <>
              <Icons.search className="mr-2 h-4 w-4" />
              {scanned ? "Scan again" : "Scan for conflicts"}
            </>
          )}
        </Button>
        {notEnough && !needsIndexing && (
          <p className="text-xs text-muted-foreground">
            You need at least 2 indexed decisions to scan for conflicts.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {/* Results */}
      {scanned && !scanning && conflicts.length === 0 && !error && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10">
            <Icons.checkCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="font-medium">No conflicts found</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your decisions look consistent. Re-scan after you capture more.
          </p>
        </div>
      )}

      {conflicts.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found <span className="font-medium text-foreground">{conflicts.length}</span> potential{" "}
            {conflicts.length === 1 ? "conflict" : "conflicts"}.
          </p>
          {conflicts.map((c, i) => {
            const s = SEVERITY_STYLES[c.severity]
            return (
              <div key={i} className={`rounded-xl border ${s.ring} bg-card p-5`}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icons.alertCircle className="h-4 w-4 text-error" />
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.badge}`}>
                      {s.label} conflict
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.workspaceName}</span>
                </div>

                <p className="mb-4 text-sm">{c.reason}</p>

                <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
                  <ConflictSide decision={c.a} workspaceId={c.workspaceId} />
                  <div className="flex items-center justify-center py-1 sm:py-0">
                    <span className="rounded-full border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      vs
                    </span>
                  </div>
                  <ConflictSide decision={c.b} workspaceId={c.workspaceId} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ConflictSide({
  decision,
  workspaceId,
}: {
  decision: { id: string; title: string; summary: string }
  workspaceId: string
}) {
  return (
    <Link
      href={`/dashboard/workspaces/${workspaceId}/decisions/${decision.id}`}
      className="group flex flex-col rounded-lg border bg-background/60 p-3 transition-colors hover:border-primary/30"
    >
      <p className="text-sm font-medium leading-snug group-hover:text-primary">{decision.title}</p>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{decision.summary}</p>
    </Link>
  )
}
