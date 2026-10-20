"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { parseExport, type ParsedConversation, type ExportSource } from "@/lib/import/parse-export"

interface Workspace {
  id: string
  name: string
}

const SOURCE_LABEL: Record<ExportSource, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
}

export default function ImportPage() {
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([])
  const [workspaceId, setWorkspaceId] = React.useState("")
  const [source, setSource] = React.useState<ExportSource | null>(null)
  const [conversations, setConversations] = React.useState<ParsedConversation[]>([])
  const [selected, setSelected] = React.useState<Set<number>>(new Set())
  const [parseError, setParseError] = React.useState<string | null>(null)
  const [importing, setImporting] = React.useState(false)
  const [result, setResult] = React.useState<{ imported: number; duplicates: number } | null>(null)
  const router = useRouter()
  const [shareUrl, setShareUrl] = React.useState("")
  const [shareLoading, setShareLoading] = React.useState(false)
  const [shareError, setShareError] = React.useState<string | null>(null)
  const [autoExtract, setAutoExtract] = React.useState(true)
  const [shareNote, setShareNote] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/workspaces")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled || !Array.isArray(data)) return
        setWorkspaces(data)
        if (data[0]) setWorkspaceId(data[0].id)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleFile = React.useCallback(async (file: File) => {
    setParseError(null)
    setResult(null)
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const { source: src, conversations: convs } = parseExport(json)
      if (!src || convs.length === 0) {
        setParseError(
          "Couldn't find any conversations. Upload the conversations.json from a ChatGPT or Claude data export."
        )
        setSource(null)
        setConversations([])
        setSelected(new Set())
        return
      }
      setSource(src)
      setConversations(convs)
      setSelected(new Set(convs.map((_, i) => i))) // select all by default
    } catch {
      setParseError("That file isn't valid JSON. Make sure it's the conversations.json export file.")
    }
  }, [])

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const allSelected = conversations.length > 0 && selected.size === conversations.length
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(conversations.map((_, i) => i)))
  }

  const importFromUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspaceId || !shareUrl.trim()) return
    setShareLoading(true)
    setShareError(null)
    setShareNote(null)
    try {
      const res = await fetch("/api/conversations/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: shareUrl.trim(), workspaceId, autoExtract }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || "Failed to import conversation")
      if (data.duplicate) {
        setShareNote("You already imported this chat — opening the existing copy.")
        await new Promise((r) => setTimeout(r, 900))
      }
      router.push(`/dashboard/workspaces/${workspaceId}/conversations/${data.conversation.id}` as never)
    } catch (err) {
      setShareError(err instanceof Error ? err.message : "Failed to import conversation")
      setShareLoading(false)
    }
  }

  const doImport = async () => {
    if (!workspaceId || selected.size === 0) return
    setImporting(true)
    setResult(null)
    try {
      const payload = conversations
        .filter((_, i) => selected.has(i))
        .map((c) => ({ title: c.title, content: c.content, occurredAt: c.createdAt }))
      const res = await fetch("/api/conversations/import-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, conversations: payload }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Import failed")
      setResult({ imported: data.imported, duplicates: data.duplicates ?? 0 })
      setConversations([])
      setSelected(new Set())
      setSource(null)
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Import failed")
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
          Import your AI chats
        </h1>
        <p className="mt-1 text-muted-foreground">
          Paste a share link to pull in a single chat, or upload an export file for your whole history.
        </p>
      </div>

      {/* Share link */}
      <form onSubmit={importFromUrl} className="space-y-4 rounded-xl border bg-card p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Import into workspace</label>
          {workspaces.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No workspaces yet.{" "}
              <Link href="/dashboard/workspaces" className="text-primary hover:underline">
                Create one first
              </Link>
              .
            </p>
          ) : (
            <select
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Chat share link</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="url"
              placeholder="https://chatgpt.com/share/…"
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
              disabled={shareLoading}
            />
            <Button type="submit" disabled={shareLoading || !shareUrl.trim() || !workspaceId}>
              {shareLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              {shareLoading ? "Importing…" : "Import chat"}
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            In ChatGPT, open a chat → Share → Create link, then paste it here. Claude and Gemini block server-side fetching — for those, use the browser extension or paste the text.
          </p>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoExtract}
              onChange={(e) => setAutoExtract(e.target.checked)}
              disabled={shareLoading}
              className="h-4 w-4 accent-[var(--tw-pr)]"
            />
            Extract decisions, action items and questions automatically
          </label>
          {shareNote && <p className="mt-2 text-sm text-muted-foreground">{shareNote}</p>}
          {shareError && <p className="mt-2 text-sm text-error">{shareError}</p>}
        </div>
      </form>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or upload an export file
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* How to export */}
      <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="mb-1.5 font-semibold text-foreground">How to get your export file</p>
        <p>
          <span className="font-medium text-foreground">ChatGPT:</span> Settings → Data controls →
          Export data → check your email → unzip → use <code className="text-xs">conversations.json</code>
        </p>
        <p className="mt-1">
          <span className="font-medium text-foreground">Claude:</span> Settings → Privacy → Export
          data → use the <code className="text-xs">conversations.json</code>
        </p>
      </div>

      {/* Success */}
      {result && (
        <div className="flex items-center justify-between rounded-xl border border-success/30 bg-success/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-success">
            <Icons.checkCircle className="h-5 w-5" />
            Imported {result.imported} conversation{result.imported === 1 ? "" : "s"}
            {result.duplicates > 0 ? ` (${result.duplicates} already imported, skipped)` : ""}. Open a
            conversation to extract decisions.
          </div>
          <Link href={`/dashboard/workspaces/${workspaceId}`}>
            <Button size="sm" variant="outline">
              View workspace
            </Button>
          </Link>
        </div>
      )}

      {/* Workspace + upload */}
      <div className="space-y-4 rounded-xl border bg-card p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Import into workspace</label>
          {workspaces.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No workspaces yet.{" "}
              <Link href="/dashboard/workspaces" className="text-primary hover:underline">
                Create one first
              </Link>
              .
            </p>
          ) : (
            <select
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Export file (.json)</label>
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
            className="block w-full cursor-pointer rounded-lg border bg-background text-sm file:mr-3 file:cursor-pointer file:border-0 file:bg-muted file:px-4 file:py-2.5 file:text-sm file:font-medium hover:file:bg-accent"
          />
        </div>

        {parseError && <p className="text-sm text-error">{parseError}</p>}
      </div>

      {/* Parsed conversations */}
      {conversations.length > 0 && source && (
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {SOURCE_LABEL[source]} export
              </span>
              <span className="text-sm text-muted-foreground">
                {conversations.length} found · {selected.size} selected
              </span>
            </div>
            <button
              onClick={toggleAll}
              className="text-xs font-medium text-primary hover:underline"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">
            {conversations.map((conv, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent/50",
                  selected.has(i) && "bg-accent/40"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                    selected.has(i) ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  )}
                >
                  {selected.has(i) && <Icons.check className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {conv.messageCount} messages
                    {conv.createdAt
                      ? ` · ${new Date(conv.createdAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t px-5 py-4">
            <Button
              onClick={doImport}
              disabled={importing || selected.size === 0 || !workspaceId}
              className="w-full sm:w-auto"
            >
              {importing ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.plus className="mr-2 h-4 w-4" />
              )}
              Import {selected.size} conversation{selected.size === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
