"use client"

import * as React from "react"

export function AIProviderStatus() {
  const [health, setHealth] = React.useState<{
    connected: boolean
    provider: string
    model: string
    lastCheck: string
    available: boolean
    error?: string
  } | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/system/ai", { cache: "no-store" })
        if (!res.ok) throw new Error("Health check failed")
        setHealth(await res.json())
      } catch {
        setHealth({
          connected: false,
          provider: "unknown",
          model: "unknown",
          lastCheck: new Date().toISOString(),
          available: false,
          error: "Failed to fetch health",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchHealth()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
        <span className="text-sm font-medium">Checking...</span>
      </div>
    )
  }

  if (!health) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-error" />
        <span className="text-sm font-medium">Unknown</span>
      </div>
    )
  }

  const statusColor = health.available ? "bg-success" : health.error === "Missing API key" ? "bg-warning" : "bg-error"
  const statusText = health.available ? "Connected" : health.error === "Missing API key" ? "Missing API Key" : "Error"

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`h-3 w-3 rounded-full ${statusColor}`} />
        <span className="text-sm font-medium">{statusText}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Provider:</span>
          <span className="ml-2 font-mono">{health.provider}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Model:</span>
          <span className="ml-2 font-mono">{health.model}</span>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">Last Check:</span>
          <span className="ml-2 font-mono">{new Date(health.lastCheck).toLocaleString()}</span>
        </div>
      </div>
      {health.error && <p className="text-xs text-error mt-1">{health.error}</p>}
    </div>
  )
}