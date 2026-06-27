"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

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