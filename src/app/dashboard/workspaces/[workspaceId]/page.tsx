import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import { Badge } from "@/components/ui/badge"
import { getOrCreateUser } from "@/lib/api-utils"
import { WorkspaceActions } from "./components"
import { ImportConversationButton } from "./import"
import { CreateDecisionButton } from "./decisions"
import { CreateActionItemButton } from "./action-items"
import { CreateQuestionButton } from "./questions"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Workspace",
  description: "Workspace details",
}

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const user = await getOrCreateUser()

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: user.id },
    include: {
      conversations: { orderBy: { createdAt: "desc" } },
      decisions: { orderBy: { createdAt: "desc" }, take: 50 },
      actionItems: { orderBy: { createdAt: "desc" }, take: 50 },
      questions: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  })

  if (!workspace) notFound()

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/workspaces"
            className="mt-1 text-muted-foreground hover:text-foreground"
          >
            <Icons.chevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {workspace.name}
            </h1>
            <p className="mt-1 text-muted-foreground text-sm">
              {workspace.conversations.length} conversations · {workspace.decisions.length} decisions · {workspace.actionItems.length} action items · {workspace.questions.length} questions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ImportConversationButton workspaceId={workspace.id} />
          <CreateDecisionButton workspaceId={workspace.id} />
          <CreateActionItemButton workspaceId={workspace.id} />
          <CreateQuestionButton workspaceId={workspace.id} />
          <Link
            href={`/dashboard/workspaces/${workspace.id}/memory-chat`}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Icons.brain className="h-4 w-4" />
            <span>Memory Chat</span>
            <Badge variant="secondary" className="text-[9px] px-1 py-0">
              Beta
            </Badge>
          </Link>
          <WorkspaceActions workspaceId={workspace.id} workspaceName={workspace.name} />
        </div>
      </div>

      {/* Conversations */}
      <Section icon={Icons.messageSquare} title="Conversations" count={workspace.conversations.length} emptyMessage="Import a conversation to start working with your data.">
        {workspace.conversations.map((conv: { id: string; title: string; content: string; createdAt: Date }) => {
          const preview = conv.content.length > 150 ? conv.content.slice(0, 150) + "..." : conv.content
          return (
            <Link key={conv.id} href={`/dashboard/workspaces/${workspace.id}/conversations/${conv.id}`}>
              <div className="flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:shadow-md">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icons.messageSquare className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{conv.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(conv.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  {preview && <p className="mt-2 text-xs text-muted-foreground line-clamp-2 pl-[52px]">{preview}</p>}
                </div>
                <Icons.chevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-4" />
              </div>
            </Link>
          )
        })}
      </Section>

      {/* Decisions */}
      <Section icon={Icons.gitBranch} title="Decisions" count={workspace.decisions.length} emptyMessage="Create a decision to start building your decision memory.">
        {workspace.decisions.map((dec: { id: string; title: string; summary: string; status: string; confidence: number; createdAt: Date }) => (
          <Link key={dec.id} href={`/dashboard/workspaces/${workspace.id}/decisions/${dec.id}`}>
            <div className="rounded-xl border bg-card p-4 transition-all hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icons.gitBranch className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{dec.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={getStatusBadgeClass(dec.status)}>
                      {dec.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{(dec.confidence * 100).toFixed(0)}%</span>
                    <span className="text-xs text-muted-foreground">{new Date(dec.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Icons.chevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
              {dec.summary && <p className="mt-2 text-xs text-muted-foreground pl-[52px] line-clamp-2">{dec.summary}</p>}
            </div>
          </Link>
        ))}
      </Section>

      {/* Action Items */}
      <Section icon={Icons.checkCircle} title="Action Items" count={workspace.actionItems.length} emptyMessage="Create an action item to track tasks.">
        {workspace.actionItems.map((item: { id: string; title: string; description: string; status: string; priority: string; createdAt: Date }) => (
          <div key={item.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.status === "completed" ? "bg-success/20" : "bg-muted"}`}>
                <Icons.checkCircle className={`h-5 w-5 ${item.status === "completed" ? "text-success" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-medium ${item.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{item.title}</p>
                  <span className={getPriorityBadgeClass(item.priority)}>
                    {item.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={getStatusBadgeClass(item.status)}>
                    {item.status === "in_progress" ? "in progress" : item.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            {item.description && <p className="mt-2 text-xs text-muted-foreground pl-[52px] line-clamp-2">{item.description}</p>}
          </div>
        ))}
      </Section>

      {/* Questions */}
      <Section icon={Icons.helpCircle} title="Questions" count={workspace.questions.length} emptyMessage="Create a question to track open discussions.">
        {workspace.questions.map((q: { id: string; question: string; status: string; createdAt: Date }) => (
          <div key={q.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${q.status === "resolved" ? "bg-success/20" : "bg-warning/20"}`}>
                <Icons.helpCircle className={`h-5 w-5 ${q.status === "resolved" ? "text-success" : "text-warning"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{q.question}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={getStatusBadgeClass(q.status)}>
                    {q.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Section>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  count,
  emptyMessage,
  children,
}: {
  icon: any
  title: string
  count: number
  emptyMessage: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-foreground" />
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">({count})</span>
      </div>
      {count > 0 ? (
        <div className="space-y-2">{children}</div>
      ) : (
        <div className="flex h-[120px] items-center justify-center rounded-xl border border-dashed">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}

function getStatusBadgeClass(status: string): string {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
  switch (status) {
    case "accepted":
    case "completed":
    case "resolved":
      return `${base} badge-success`
    case "rejected":
      return `${base} badge-error`
    case "pending":
    case "open":
      return `${base} badge-warning`
    case "in_progress":
      return `${base} badge-info`
    default:
      return `${base} bg-muted text-muted-foreground`
  }
}

function getPriorityBadgeClass(priority: string): string {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
  switch (priority) {
    case "high":
      return `${base} badge-error`
    case "medium":
      return `${base} badge-warning`
    case "low":
      return `${base} badge-info`
    default:
      return `${base} bg-muted text-muted-foreground`
  }
}