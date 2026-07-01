import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import { getOrCreateUser } from "@/lib/api-utils"
import { DeleteConversationButton } from "./delete-button"
import { ExtractReviewButton } from "./extract-review"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Conversation",
  description: "View conversation",
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ workspaceId: string; conversationId: string }>
}) {
  const { workspaceId, conversationId } = await params
  const user = await getOrCreateUser()

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: user.id, workspaceId },
    include: { workspace: { select: { name: true } } },
  })

  if (!conversation) notFound()

  const lines = conversation.content.split("\n")

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <Link
            href={`/dashboard/workspaces/${workspaceId}`}
            className="mt-1 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Icons.chevronLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight wrap-break-word">
              {conversation.title}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>in {conversation.workspace.name}</span>
              <span>·</span>
              <span>
                {new Date(conversation.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExtractReviewButton
            conversationId={conversation.id}
            workspaceId={workspaceId}
          />
          <DeleteConversationButton
            conversationId={conversation.id}
            workspaceId={workspaceId}
          />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/workspaces/${workspaceId}`}>
              <Icons.chevronLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      {/* Conversation Content */}
      <div className="rounded-xl border bg-card p-6">
        <div className="space-y-1">
          {lines.map((line: string, i: number) => {
            const speakerMatch = line.match(/^([A-Za-zÀ-ÿ]+):/)
            if (speakerMatch) {
              const speaker = speakerMatch[1]
              const text = line.slice(speaker.length + 1).trim()
              return (
                <div key={i} className="flex gap-3 py-1.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {speaker.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-semibold">{speaker}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {text}
                    </span>
                  </div>
                </div>
              )
            }
            if (line.trim() === "") {
              return <div key={i} className="h-2" />
            }
            return (
              <p key={i} className="py-0.5 text-sm text-muted-foreground">
                {line}
              </p>
            )
          })}
        </div>
      </div>

      {/* Raw Content */}
      <details className="group rounded-xl border bg-card">
        <summary className="flex cursor-pointer items-center gap-2 p-4 text-sm font-medium text-muted-foreground hover:text-foreground">
          <Icons.chevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
          View raw content
        </summary>
        <div className="border-t p-4">
          <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
            {conversation.content}
          </pre>
        </div>
      </details>
    </div>
  )
}