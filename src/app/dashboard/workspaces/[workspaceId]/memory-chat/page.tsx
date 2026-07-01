"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/lib/icons"

interface Message {
  role: "user" | "assistant"
  content: string
  sources?: {
    decisions: Array<{ id: string; title: string; summary: string; status: string }>
    actionItems: Array<{ id: string; title: string; status: string; priority: string }>
    questions: Array<{ id: string; question: string; status: string }>
  }
  timestamp?: number
  relatedQuestions?: string[]
}

const SUGGESTED_QUESTIONS = [
  "Why did we choose PostgreSQL?",
  "What decisions were made this week?",
  "Summarize our architecture decisions.",
  "What action items remain?",
  "Which questions are still unresolved?",
  "Give me an overview of this workspace.",
]

function renderMarkdown(text: string) {
  const lines = text.split(String.fromCharCode(10))
  const elements: React.ReactNode[] = []
  let currentList: string[] = []

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={"ul-" + elements.length} className="list-disc pl-5 space-y-1 my-1.5">
          {currentList.map((item, idx) => (
            <li key={idx} className="text-sm leading-relaxed">{renderInline(item)}</li>
          ))}
        </ul>
      )
      currentList = []
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      currentList.push(trimmed.slice(2))
    } else {
      flushList()
      if (trimmed !== "") {
        elements.push(
          <p key={"p-" + i} className="text-sm leading-relaxed mb-1.5">{renderInline(trimmed)}</p>
        )
      }
    }
  })
  flushList()
  return elements
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function formatTime(ts?: number) {
  if (!ts) return ""
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function MemoryChatPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string | undefined
  const [workspaceName, setWorkspaceName] = React.useState("")
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = React.useState(false)
  const [isClearing, setIsClearing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Load conversation history
  React.useEffect(() => {
    if (!workspaceId) return
    setIsHistoryLoading(true)
    setError(null)
    fetch(`/api/memory-chat/history?workspaceId=${workspaceId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load history")
        return res.json()
      })
      .then(data => {
        const loaded = (data.messages || []).map((m: any) => ({
          role: m.role,
          content: m.content,
          sources: m.sources,
          timestamp: m.createdAt ? new Date(m.createdAt).getTime() : undefined,
        }))
        setMessages(loaded)
      })
      .catch(err => {
        console.error("History load failed:", err)
        setError("Failed to load chat history")
      })
      .finally(() => setIsHistoryLoading(false))
  }, [workspaceId])

  // Fetch workspace name from API
  React.useEffect(() => {
    if (!workspaceId) return
    fetch(`/api/workspaces/${workspaceId}`)
      .then(r => r.json())
      .then(data => {
        if (data.name) setWorkspaceName(data.name)
      })
      .catch(() => {})
  }, [workspaceId])

  // Auto-scroll when messages change or loading state changes
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const sendMessage = React.useCallback(async (text: string) => {
    if (!text.trim() || isLoading || !workspaceId) return

    const trimmed = text.trim()
    // Optimistic user message
    setMessages(prev => [...prev, { role: "user", content: trimmed, timestamp: Date.now() }])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/memory-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, message: trimmed }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }))
        throw new Error(data.error || `Request failed (${res.status})`)
      }

      const data = await res.json()
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        relatedQuestions: data.relatedQuestions,
        timestamp: Date.now(),
      }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      setError(msg)
      console.error("Send message failed:", err)
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }, [workspaceId, isLoading])

  const handleSubmit = React.useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    sendMessage(input)
  }, [input, sendMessage])

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }, [input, sendMessage])

  const askQuestion = React.useCallback((q: string) => {
    sendMessage(q)
  }, [sendMessage])

  const copyToClipboard = React.useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }, [])

  const retryLast = React.useCallback(() => {
    setError(null)
  }, [])

  const handleClearChat = React.useCallback(async () => {
    if (!workspaceId || messages.length === 0) return
    if (!window.confirm("Delete all chat messages? This cannot be undone.")) return

    setIsClearing(true)
    setError(null)

    try {
      const res = await fetch(`/api/memory-chat/clear?workspaceId=${workspaceId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to clear chat" }))
        throw new Error(data.error || "Failed to clear chat")
      }

      setMessages([])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      setError(msg)
      console.error("Clear chat failed:", err)
    } finally {
      setIsClearing(false)
    }
  }, [workspaceId, messages.length])

  // Workspace missing
  if (!workspaceId) {
    return (
      <div className="-m-4 sm:-m-6 lg:-m-8" style={{
        height: 'calc(100dvh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <p className="text-muted-foreground">Workspace not found.</p>
        <Link href="/dashboard/workspaces">
          <Button variant="outline" className="mt-4">Back to Workspaces</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8" style={{
      height: 'calc(100dvh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* HEADER — fixed, never scrolls */}
      <div style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleClearChat}
                variant="ghost"
                size="icon"
                disabled={isClearing || messages.length === 0}
                title="Clear chat history"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <Icons.trash className="h-4 w-4" />
              </Button>
            </div>
            <Link
              href={"/dashboard/workspaces/" + workspaceId}
              className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              <Icons.chevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Memory Chat
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Ask questions about your team's decisions, action items and conversations.
              </p>
              {workspaceName && (
                <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1.5">
                  <Icons.folderKanban className="h-3 w-3" />
                  Workspace: {workspaceName}
                </p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
            AI Ready
          </Badge>
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{
        height: '1px',
        background: 'var(--tw-bd)',
        flexShrink: 0,
      }} />

      {/* MESSAGES AREA — scrolls internally */}
      <div
        className="messages-area"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--tw-bd) transparent',
        }}
      >
        {isHistoryLoading ? (
          <div className="space-y-5">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-3 items-start">
                {i % 3 === 0 ? (
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                ) : (
                  <div className="w-8 shrink-0" />
                )}
                <div className="flex-1 space-y-2">
                  <Skeleton className={cn("h-4", i === 0 ? "w-3/4" : i === 1 ? "w-1/2" : "w-5/6")} />
                  <Skeleton className={cn("h-4", i === 2 ? "w-2/3" : "w-1/3")} />
                  {i % 3 === 0 && <Skeleton className="h-3 w-1/4 mt-2" />}
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          /* Empty state — centered vertically */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
          }}>
            <h2 className="text-2xl font-semibold tracking-tight">Memory Chat</h2>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed text-center">
              Ask questions about your team's decisions, action items and conversations.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[600px]">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => askQuestion(q)}
                  className="text-left px-5 py-4 rounded-2xl border border-border/60 bg-card hover:bg-accent/50 hover:border-primary/20 hover:shadow-lg hover:shadow-black/5 transition-all text-sm text-muted-foreground hover:text-foreground group"
                >
                  <span className="font-medium text-foreground/80 group-hover:text-primary transition-colors">{q}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message list */
          <div className="flex flex-col gap-5">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={cn("flex gap-3 items-start group", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 mt-0.5">
                      <span className="text-[11px] font-bold text-primary">R</span>
                    </div>
                  )}
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary mt-0.5 order-last">
                      <span className="text-[10px] font-bold text-primary-foreground">You</span>
                    </div>
                  )}
                  <div className={cn("max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 sm:px-5 py-3.5 relative", msg.role === "user" ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md" : "bg-muted text-foreground border border-border shadow-sm rounded-bl-md")}>
                    <div className="text-sm leading-relaxed">{renderMarkdown(msg.content)}</div>
                    {msg.timestamp && (
                      <div className="mt-1 text-[10px] opacity-0 group-hover:opacity-60 transition-opacity">
                        {formatTime(msg.timestamp)}
                      </div>
                    )}
                    {msg.sources && msg.role === "assistant" && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">Sources</p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.decisions && msg.sources.decisions.length > 0 && msg.sources.decisions.map((d: any) => (
                            <Link
                              key={d.id}
                              href={"/dashboard/workspaces/" + workspaceId + "/decisions/" + d.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                            >
                              <Icons.check className="h-2.5 w-2.5" />
                              <span className="truncate max-w-[150px]">{d.title}</span>
                              <span className="opacity-50">· {d.status}</span>
                            </Link>
                          ))}
                          {msg.sources.actionItems && msg.sources.actionItems.length > 0 && msg.sources.actionItems.map((a: any) => (
                            <span
                              key={a.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            >
                              <Icons.check className="h-2.5 w-2.5" />
                              <span className="truncate max-w-[150px]">{a.title}</span>
                              <span className="opacity-50">· {a.status}</span>
                            </span>
                          ))}
                          {msg.sources.questions && msg.sources.questions.length > 0 && msg.sources.questions.map((q: any) => (
                            <span
                              key={q.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            >
                              <Icons.helpCircle className="h-2.5 w-2.5" />
                              <span className="truncate max-w-[150px]">{q.question}</span>
                              <span className="opacity-50">· {q.status}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Copy button on hover */}
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => copyToClipboard(msg.content)}
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 flex items-center justify-center rounded-full bg-muted border border-border shadow-sm hover:bg-accent"
                        title="Copy response"
                      >
                        <Icons.copy className="h-3 w-3 text-muted-foreground" />
                      </button>
                    )}
                    {/* Related questions - only on last assistant message */}
                    {msg.role === "assistant" && messages[messages.length - 1] === msg && msg.relatedQuestions && msg.relatedQuestions.length > 0 && !isLoading && (() => {
                      const askedQuestions = new Set(
                        messages
                          .filter(m => m.role === 'user')
                          .map(m => m.content.toLowerCase().trim())
                      )
                      const filteredRelated = msg.relatedQuestions.filter(q =>
                        !askedQuestions.has(q.toLowerCase().trim())
                      )
                      if (filteredRelated.length === 0) return null
                      return (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2">
                            Related questions
                          </p>
                          <div className="flex flex-col gap-2">
                            {filteredRelated.map((q, idx) => (
                              <button
                                key={idx}
                                onClick={() => sendMessage(q)}
                                className="text-left text-sm px-3 py-2 rounded-lg
                                           border border-border
                                           bg-background
                                           hover:bg-accent
                                           hover:border-primary/30
                                           text-foreground/80
                                           hover:text-foreground
                                           transition-all duration-150
                                           cursor-pointer"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 items-start"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 mt-0.5">
                  <Icons.bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-card border border-border/60 shadow-sm rounded-2xl rounded-bl-md px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error banner with retry */}
            {error && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-error/30 bg-error/5 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-error">{error}</p>
                  <button
                    onClick={retryLast}
                    className="text-xs text-error/70 hover:text-error underline underline-offset-2"
                  >
                    Retry
                  </button>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* INPUT — fixed at bottom, never scrolls */}
      <div style={{
        flexShrink: 0,
        borderTop: '1px solid var(--tw-bd)',
        padding: '16px 24px',
        background: 'var(--background)',
      }}>
        <form onSubmit={handleSubmit} className="mx-auto max-w-[900px]">
          <div className="flex items-end gap-3 bg-card border border-border/60 rounded-2xl px-4 py-3 shadow-lg shadow-black/5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your workspace..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground/60 focus:outline-none min-h-[24px] max-h-[200px] py-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="shrink-0 h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <Icons.spinner className="h-4 w-4 animate-spin" /> : <Icons.send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
        </form>
      </div>
    </div>
  )
}