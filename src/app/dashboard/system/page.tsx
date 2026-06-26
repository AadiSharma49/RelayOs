import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getOrCreateUser } from "@/lib/api-utils"
import { AIProviderStatus } from "@/components/dashboard/ai-provider-status"

export const metadata: Metadata = {
  title: "System Health",
  description: "System diagnostics",
}

export default async function SystemPage() {
  const user = await getOrCreateUser()

  let dbConnected = false
  let dbError: string | null = null

  try {
    await prisma.$queryRaw`SELECT 1`
    dbConnected = true
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Unknown error"
  }

  const counts = dbConnected
    ? await Promise.all([
        prisma.workspace.count({ where: { userId: user.id } }),
        prisma.conversation.count({ where: { userId: user.id } }),
        prisma.decision.count({ where: { userId: user.id } }),
        prisma.actionItem.count({ where: { userId: user.id } }),
        prisma.question.count({ where: { userId: user.id } }),
      ])
    : [0, 0, 0, 0, 0]

  const [workspaceCount, conversationCount, decisionCount, actionItemCount, questionCount] = counts

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Diagnostics and system status
        </p>
      </div>

      {/* Connection Status */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold mb-4">Database Connection</h2>
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${dbConnected ? "bg-success" : "bg-error"}`} />
          <span className="text-sm font-medium">
            {dbConnected ? "Connected" : "Disconnected"}
          </span>
          {dbConnected ? (
            <Badge variant="success">Operational</Badge>
          ) : (
            <Badge variant="error">Error</Badge>
          )}
        </div>
        {dbError && (
          <p className="mt-3 text-sm text-muted-foreground bg-muted rounded-lg p-3 font-mono">
            {dbError}
          </p>
        )}
      </Card>

      {/* Record Counts */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold mb-4">Record Counts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <CountCard label="Workspaces" count={workspaceCount} />
          <CountCard label="Conversations" count={conversationCount} />
          <CountCard label="Decisions" count={decisionCount} />
          <CountCard label="Action Items" count={actionItemCount} />
          <CountCard label="Questions" count={questionCount} />
        </div>
      </Card>

      {/* AI Provider */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold mb-4">AI Provider</h2>
        <AIProviderStatus />
      </Card>

      {/* Status Guide */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold mb-4">Status Reference</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="success">Operational</Badge>
            <span className="text-sm text-muted-foreground">All systems working</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="warning">Degraded</Badge>
            <span className="text-sm text-muted-foreground">Partial functionality</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="error">Error</Badge>
            <span className="text-sm text-muted-foreground">System not responding</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="info">Info</Badge>
            <span className="text-sm text-muted-foreground">Informational status</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

function CountCard({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold mt-1">{count}</p>
    </div>
  )
}

async function getAIHealth() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/system/ai`, {
      cache: "no-store",
    })
    if (!res.ok) throw new Error("Health check failed")
    return res.json()
  } catch {
    return null
  }
}

