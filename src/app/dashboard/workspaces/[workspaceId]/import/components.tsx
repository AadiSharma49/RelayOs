"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

/**
 * Capture options, ordered by how we want people to add conversations:
 *   1. Browser extension  — one-click automatic capture (the primary path)
 *   2. File import        — bulk history upload
 *   3. Paste manually     — secondary fallback, tucked behind a toggle
 */
export function CaptureOptions({ workspaceId }: { workspaceId: string }) {
  const [showPaste, setShowPaste] = React.useState(false)

  return (
    <div className="space-y-4">
      {/* 1 — Browser extension (primary) */}
      <Link
        href={"/extension" as any}
        className="group flex items-center gap-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-5 transition-all hover:border-primary/50 hover:shadow-md"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <Icons.plug className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">Capture with the browser extension</p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Recommended
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            One click on any ChatGPT, Claude or Gemini chat — no copy-paste.
          </p>
        </div>
        <Icons.arrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </Link>

      {/* 2 — File import (bulk history) */}
      <Link
        href={"/dashboard/import" as any}
        className="group flex items-center gap-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icons.download className="h-5 w-5 text-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Import your chat history</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Bulk-upload your ChatGPT or Claude export file.
          </p>
        </div>
        <Icons.arrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </Link>

      {/* 3 — Paste manually (secondary fallback) */}
      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={() => setShowPaste((v) => !v)}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {showPaste ? "Hide manual paste" : "or paste a conversation manually"}
        </button>
      </div>

      {showPaste && (
        <div className="rounded-xl border bg-card p-5">
          <ImportConversationForm workspaceId={workspaceId} />
        </div>
      )}
    </div>
  )
}

export function ImportConversationForm({
  workspaceId,
}: {
  workspaceId: string
}) {
  const router = useRouter()
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          workspaceId,
        }),
      })
      if (!res.ok) {
        const errorBody = await res.text()
        console.error("Conversation creation failed:", { status: res.status, body: errorBody })
        throw new Error(errorBody || "Failed to save conversation")
      }
      const conversation = await res.json()
      router.push(
        `/dashboard/workspaces/${workspaceId}/conversations/${conversation.id}` as any
      )
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save conversation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
       {error && (
         <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error mb-6">
           {error}
         </div>
       )}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Customer feedback discussion"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="content">Conversation Content</Label>
          <textarea
            id="content"
            rows={16}
            className="w-full resize-y rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={`Paste your conversation here...

Example:
John: I think we should focus on UX improvements
Sarah: Agreed, but we also need to address performance
Mike: Let's prioritize both for the next sprint`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Paste any conversation, chat log, or discussion text. Format is
            preserved as-is.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading || !title.trim() || !content.trim()} size="lg">
            {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            <Icons.fileText className="mr-2 h-4 w-4" />
            Save Conversation
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  )
}