"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/lib/icons"
import { cn } from "@/lib/utils"

type SearchResultType = "conversation" | "decision" | "actionItem" | "question"

interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  description: string
  workspaceId: string
  workspaceName: string
  url: string
}

interface SearchResponse {
  results: {
    conversations: SearchResult[]
    decisions: SearchResult[]
    actionItems: SearchResult[]
    questions: SearchResult[]
  }
}

const TYPE_LABELS: Record<SearchResultType, string> = {
  conversation: "Conversation",
  decision: "Decision",
  actionItem: "Action Item",
  question: "Question",
}

const TYPE_ICONS: Record<SearchResultType, React.ElementType> = {
  conversation: Icons.messageSquare,
  decision: Icons.gitBranch,
  actionItem: Icons.checkCircle,
  question: Icons.helpCircle,
}

export function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResponse["results"] | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const router = useRouter()
  const abortRef = React.useRef<AbortController | null>(null)

  const flatResults = React.useMemo(() => {
    if (!results) return []
    return [
      ...results.conversations,
      ...results.decisions,
      ...results.actionItems,
      ...results.questions,
    ]
  }, [results])

  React.useEffect(() => {
    if (open) {
      setQuery("")
      setResults(null)
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null)
      return
    }

    setLoading(true)
    setSelectedIndex(0)
    abortRef.current?.abort()
    const controller = new AbortController()

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        if (res.ok) {
          const data = (await res.json()) as SearchResponse
          setResults(data.results)
        }
      } catch {
        // aborted or network error — ignore
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query])

  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const item = flatResults[selectedIndex]
        if (item) {
          onOpenChange(false)
          router.push(item.url)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, flatResults, selectedIndex, router, onOpenChange])

  const hasResults = results && flatResults.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Search Memory</DialogTitle>
        <DialogDescription className="sr-only">
          Search across conversations, decisions, action items, and questions
        </DialogDescription>
        <div className="flex items-center border-b px-4">
          <Icons.search className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations, decisions, action items, questions..."
            className="h-12 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground ml-2 shrink-0">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading && (
            <div className="space-y-2 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !hasResults && query.length >= 2 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Icons.search className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium">No results found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching for something else
              </p>
            </div>
          )}

          {!loading && !query && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Icons.search className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium">Start typing to search</p>
              <p className="text-xs text-muted-foreground mt-1">
                Search across all your conversations, decisions, action items, and questions
              </p>
            </div>
          )}

          {hasResults && (
            <div className="space-y-4">
              {results.conversations.length > 0 && (
                <ResultGroup
                  label="Conversations"
                  items={results.conversations}
                  selectedIndex={selectedIndex}
                  offset={0}
                  icon={Icons.messageSquare}
                  onNavigate={(url) => {
                    onOpenChange(false)
                    router.push(url)
                  }}
                />
              )}
              {results.decisions.length > 0 && (
                <ResultGroup
                  label="Decisions"
                  items={results.decisions}
                  selectedIndex={selectedIndex}
                  offset={results.conversations.length}
                  icon={Icons.gitBranch}
                  onNavigate={(url) => {
                    onOpenChange(false)
                    router.push(url)
                  }}
                />
              )}
              {results.actionItems.length > 0 && (
                <ResultGroup
                  label="Action Items"
                  items={results.actionItems}
                  selectedIndex={selectedIndex}
                  offset={results.conversations.length + results.decisions.length}
                  icon={Icons.checkCircle}
                  onNavigate={(url) => {
                    onOpenChange(false)
                    router.push(url)
                  }}
                />
              )}
              {results.questions.length > 0 && (
                <ResultGroup
                  label="Questions"
                  items={results.questions}
                  selectedIndex={selectedIndex}
                  offset={
                    results.conversations.length +
                    results.decisions.length +
                    results.actionItems.length
                  }
                  icon={Icons.helpCircle}
                  onNavigate={(url) => {
                    onOpenChange(false)
                    router.push(url)
                  }}
                />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ResultGroup({
  label,
  items,
  selectedIndex,
  offset,
  icon: Icon,
  onNavigate,
}: {
  label: string
  items: SearchResult[]
  selectedIndex: number
  offset: number
  icon: React.ElementType
  onNavigate: (url: string) => void
}) {
  return (
    <div>
      <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="space-y-0.5">
        {items.map((item, i) => {
          const globalIndex = offset + i
          const isSelected = globalIndex === selectedIndex
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.url)}
              className={cn(
                "flex items-center gap-3 w-full rounded-lg px-2 py-2 text-left transition-colors",
                isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted"
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                )}
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {item.workspaceName}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
