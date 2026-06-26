"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

type ExtractionResult = {
  decisions: Array<{ title: string; summary: string; status: string; confidence: number }>
  actionItems: Array<{ title: string; description: string; priority: string }>
  questions: Array<{ question: string }>
}

export function ExtractReviewButton({
  conversationId,
  workspaceId,
}: {
  conversationId: string
  workspaceId: string
}) {
  const router = useRouter()
  const [extracting, setExtracting] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [result, setResult] = React.useState<ExtractionResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)

  // Editable state per category
  const [editedDecisions, setEditedDecisions] = React.useState<ExtractionResult["decisions"]>([])
  const [editedActions, setEditedActions] = React.useState<ExtractionResult["actionItems"]>([])
  const [editedQuestions, setEditedQuestions] = React.useState<ExtractionResult["questions"]>([])

  async function runExtraction() {
    setExtracting(true)
    setError(null)
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(body || "Extraction failed")
      }
      const data = await res.json()
      const r = data.result as ExtractionResult
      setResult(r)
      setEditedDecisions(r.decisions.map((d: any) => ({ ...d })))
      setEditedActions(r.actionItems.map((a: any) => ({ ...a })))
      setEditedQuestions(r.questions.map((q: any) => ({ ...q })))
      setOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed")
    } finally {
      setExtracting(false)
    }
  }

  async function approveAndSave() {
    setSaving(true)
    setError(null)
    try {
      const apiCalls: Promise<Response>[] = []

      // Save decisions
      for (const d of editedDecisions) {
        apiCalls.push(
          fetch("/api/decisions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: d.title,
              summary: d.summary,
              status: d.status,
              confidence: d.confidence,
              conversationId,
              workspaceId,
              source: "ai-extraction",
            }),
          })
        )
      }

      // Save action items
      for (const a of editedActions) {
        apiCalls.push(
          fetch("/api/action-items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: a.title,
              description: a.description,
              priority: a.priority,
              conversationId,
              workspaceId,
            }),
          })
        )
      }

      // Save questions
      for (const q of editedQuestions) {
        apiCalls.push(
          fetch("/api/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: q.question,
              conversationId,
              workspaceId,
            }),
          })
        )
      }

      const responses = await Promise.all(apiCalls)
      const errors = responses.filter((r) => !r.ok)
      if (errors.length > 0) {
        const bodies = await Promise.all(errors.map((r) => r.text()))
        throw new Error(`Failed to save ${errors.length} items: ${bodies.join("; ")}`)
      }

      setOpen(false)
      setResult(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  function removeDecision(i: number) {
    setEditedDecisions((prev) => prev.filter((_, idx) => idx !== i))
  }

  function removeAction(i: number) {
    setEditedActions((prev) => prev.filter((_, idx) => idx !== i))
  }

  function removeQuestion(i: number) {
    setEditedQuestions((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <>
      {error && (
        <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error mb-4">
          {error}
        </div>
      )}
      <Button
        variant="default"
        size="sm"
        onClick={runExtraction}
        disabled={extracting}
      >
        {extracting ? (
          <><Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
        ) : (
          <><Icons.zap className="mr-2 h-4 w-4" /> Extract Intelligence</>
        )}
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setResult(null) }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Extraction</DialogTitle>
            <DialogDescription>
              Review, edit, or remove detected items before saving.
            </DialogDescription>
          </DialogHeader>

          {result && (
            <div className="space-y-6 py-4">
              {/* Decisions */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Icons.gitBranch className="h-4 w-4" />
                  Decisions ({editedDecisions.length})
                </h3>
                {editedDecisions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">None detected</p>
                ) : (
                  <div className="space-y-2">
                    {editedDecisions.map((d, i) => (
                      <div key={i} className="rounded-lg border bg-card p-3 relative group">
                        <button onClick={() => removeDecision(i)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive cursor-pointer">
                          <Icons.x className="h-4 w-4" />
                        </button>
                        <p className="text-sm font-medium">{d.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{d.summary}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] capitalize text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{d.status}</span>
                          <span className="text-[10px] text-muted-foreground">{(d.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Items */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Icons.checkCircle className="h-4 w-4" />
                  Action Items ({editedActions.length})
                </h3>
                {editedActions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">None detected</p>
                ) : (
                  <div className="space-y-2">
                    {editedActions.map((a, i) => (
                      <div key={i} className="rounded-lg border bg-card p-3 relative group">
                        <button onClick={() => removeAction(i)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive cursor-pointer">
                          <Icons.x className="h-4 w-4" />
                        </button>
                        <p className="text-sm font-medium">{a.title}</p>
                        {a.description && <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>}
                        <span className="text-[10px] capitalize text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">{a.priority}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Questions */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Icons.helpCircle className="h-4 w-4" />
                  Questions ({editedQuestions.length})
                </h3>
                {editedQuestions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">None detected</p>
                ) : (
                  <div className="space-y-2">
                    {editedQuestions.map((q, i) => (
                      <div key={i} className="rounded-lg border bg-card p-3 relative group">
                        <button onClick={() => removeQuestion(i)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive cursor-pointer">
                          <Icons.x className="h-4 w-4" />
                        </button>
                        <p className="text-sm">{q.question}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {editedDecisions.length + editedActions.length + editedQuestions.length} items to save
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={approveAndSave} disabled={saving}>
                {saving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Approve & Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}