import { Metadata, Route } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Icons } from "@/lib/icons"
import { getOrCreateUser } from "@/lib/api-utils"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your workspace overview",
}

export default async function DashboardPage() {
  const user = await getOrCreateUser()

  const [workspaceCount, conversationCount, decisionCount, actionItemCount, questionCount] =
    await Promise.all([
      prisma.workspace.count({ where: { userId: user.id } }),
      prisma.conversation.count({ where: { userId: user.id } }),
      prisma.decision.count({ where: { userId: user.id } }),
      prisma.actionItem.count({ where: { userId: user.id } }),
      prisma.question.count({ where: { userId: user.id } }),
    ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, {user.firstName || "User"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<Icons.folderKanban className="h-5 w-5 text-primary" />}
          label="Workspaces"
          value={workspaceCount}
          href="/dashboard/workspaces"
        />
        <StatCard
          icon={<Icons.messageSquare className="h-5 w-5 text-primary" />}
          label="Conversations"
          value={conversationCount}
          href="/dashboard/workspaces"
        />
        <StatCard
          icon={<Icons.gitBranch className="h-5 w-5 text-primary" />}
          label="Decisions"
          value={decisionCount}
          href="/dashboard/workspaces"
        />
        <StatCard
          icon={<Icons.checkCircle className="h-5 w-5 text-success" />}
          label="Action Items"
          value={actionItemCount}
          href="/dashboard/workspaces"
        />
        <StatCard
          icon={<Icons.helpCircle className="h-5 w-5 text-warning" />}
          label="Questions"
          value={questionCount}
          href="/dashboard/workspaces"
        />
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="rounded-xl border bg-card">
          <div className="p-6">
            <p className="text-sm text-muted-foreground">
              No activity yet. Get started by{" "}
              <Link href={"/extension" as Route} className="text-primary hover:underline">
                installing the browser extension
              </Link>{" "}
              for one-click capture, or{" "}
              <Link href="/dashboard/import" className="text-primary hover:underline">
                importing your chat history
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: number
  href: string
}) {
  return (
    <Link href={href as Route}>
      <div className="rounded-xl border bg-card p-5 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            {icon}
          </div>
          <span className="text-2xl font-bold tracking-tight">{value}</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      </div>
    </Link>
  )
}