import { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import { CreateWorkspaceButton } from "./components"
import { getOrCreateUser } from "@/lib/api-utils"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Workspaces",
  description: "Manage your workspaces",
}

export default async function WorkspacesPage() {
  const user = await getOrCreateUser()

  const workspaces = await prisma.workspace.findMany({
    where: { userId: user.id },
    include: { _count: { select: { conversations: true } } },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="mt-1 text-muted-foreground">
            Organize your conversations into workspaces
          </p>
        </div>
        <CreateWorkspaceButton />
      </div>

      {workspaces.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map(
            (ws: { id: string; name: string; createdAt: Date; _count: { conversations: number } }) => (
              <Link
                key={ws.id}
                href={`/dashboard/workspaces/${ws.id}`}
                className="group"
              >
                <div className="rounded-xl border bg-card p-6 transition-all hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icons.folderKanban className="h-6 w-6 text-primary" />
                    </div>
                    <Icons.chevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h3 className="mt-4 font-semibold">{ws.name}</h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {ws._count.conversations} conversation
                      {ws._count.conversations !== 1 ? "s" : ""}
                    </span>
                    <span>·</span>
                    <span>{new Date(ws.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            )
          )}
        </div>
      ) : (
        <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <Icons.folderKanban className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No workspaces yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first workspace to start organizing conversations.
            </p>
            <CreateWorkspaceButton />
          </div>
        </div>
      )}
    </div>
  )
}