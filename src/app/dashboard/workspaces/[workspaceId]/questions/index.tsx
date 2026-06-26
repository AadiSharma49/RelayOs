"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function CreateQuestionButton({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [question, setQuestion] = React.useState("")
  const [status, setStatus] = React.useState("open")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), status, workspaceId }),
      })
      if (!res.ok) { const b = await res.text(); throw new Error(b) }
      setOpen(false); setQuestion(""); setStatus("open")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed")
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icons.helpCircle className="mr-2 h-4 w-4" />
          Question
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Create Question</DialogTitle>
            <DialogDescription>Track an open question from a discussion.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question">Question</Label>
              <Textarea id="question" placeholder="Should we migrate to React 19?" value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} autoFocus />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !question.trim()}>
              {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}