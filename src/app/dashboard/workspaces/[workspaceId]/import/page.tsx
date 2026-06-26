import { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Icons } from "@/lib/icons"
import { getOrCreateUser } from "@/lib/api-utils"
import { ImportConversationForm } from "./components"

export const metadata: Metadata = {
  title: "Import Conversation",
  description: "Import a conversation into your workspace",
}

export default async function ImportConversationPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const user = await getOrCreateUser()

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: user.id },
  })
  if (!workspace) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <Icons.chevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Import Conversation
          </h1>
          <p className="text-muted-foreground">
            Paste a conversation into{" "}
            <span className="font-medium text-foreground">
              {workspace.name}
            </span>
          </p>
        </div>
      </div>

      <ImportConversationForm workspaceId={workspace.id} />
    </div>
  )
}