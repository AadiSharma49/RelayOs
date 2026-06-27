import { Metadata, Route } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import { getOrCreateUser } from "@/lib/api-utils"
import { DecisionActions } from "./actions"

export const metadata: Metadata = {
  title: "Decision",
  description: "View decision",
}

export default async function DecisionDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string; decisionId: string }>
}) {
  const { workspaceId, decisionId } = await params
  const user = await getOrCreateUser()

  const decision = await prisma.decision.findFirst({
    where: { id: decisionId, userId: user.id, workspaceId },
    include: {
      workspace: { select: { name: true } },
      conversation: { select: { id: true, title: true } },
    },
  })

  if (!decision) notFound()

  const confidencePct = Math.round(decision.confidence * 100)

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href={`/dashboard/workspaces/${workspaceId}`}
            className="mt-1 text-muted-foreground hover:text-foreground"
          >
            <Icons.chevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {decision.title}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>in {decision.workspace.name}</span>
              <span>·</span>
              <span className="capitalize">{decision.source.replace("-", " ")}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DecisionActions
            decisionId={decision.id}
            workspaceId={workspaceId}
            title={decision.title}
            summary={decision.summary}
            status={decision.status}
            confidence={decision.confidence}
          />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/workspaces/${workspaceId}`}>
              <Icons.chevronLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      {/* Status & Confidence */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3">
          <Icons.gitBranch className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-medium capitalize">{decision.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3">
          <Icons.shield className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="text-sm font-medium">{confidencePct}%</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Summary</h2>
        <p className="text-sm leading-relaxed">{decision.summary || "No summary provided."}</p>
      </div>

      {/* Activity Metadata */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Activity</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Icons.clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span>
              {new Date(decision.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Updated:</span>
            <span>
              {new Date(decision.updatedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.fileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Source:</span>
            <span className="capitalize">{decision.source.replace("-", " ")}</span>
          </div>
          {decision.conversation && (
            <div className="flex items-center gap-2">
              <Icons.messageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">From:</span>
              <Link
                href={`/dashboard/workspaces/${workspaceId}/conversations/${decision.conversation.id}` as Route}
                className="font-medium text-primary hover:underline"
              >
                {decision.conversation.title}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}