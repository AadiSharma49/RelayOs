"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DeleteConversationButton({
  conversationId,
  workspaceId,
}: {
  conversationId: string
  workspaceId: string
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onDelete() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(body || "Failed to delete conversation")
      }
      router.push(`/dashboard/workspaces/${workspaceId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete conversation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">
          <Icons.trash className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Conversation</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this conversation? This action
            cannot be undone. Any decisions linked to this conversation will
            be preserved but disconnected.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={loading}
          >
            {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}