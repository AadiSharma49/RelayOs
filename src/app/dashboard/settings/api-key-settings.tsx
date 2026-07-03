"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import { cn } from "@/lib/utils"

type Status = "loading" | "no-key" | "has-key" | "error"

export function ApiKeySettings() {
  const [status, setStatus] = React.useState<Status>("loading")
  const [newKey, setNewKey] = React.useState<string | null>(null)
  const [working, setWorking] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/user/api-key")
        if (!res.ok) throw new Error("failed")
        const data = await res.json()
        if (!cancelled) setStatus(data.hasKey ? "has-key" : "no-key")
      } catch {
        if (!cancelled) setStatus("error")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const generate = React.useCallback(async () => {
    setWorking(true)
    setNewKey(null)
    try {
      const res = await fetch("/api/user/api-key", { method: "POST" })
      if (!res.ok) throw new Error("failed")
      const data = await res.json()
      setNewKey(data.key)
      setStatus("has-key")
    } catch {
      setStatus("error")
    } finally {
      setWorking(false)
    }
  }, [])

  const copy = React.useCallback(() => {
    if (!newKey) return
    navigator.clipboard.writeText(newKey).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [newKey])

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icons.plug className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Browser Extension API Key</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect the RelayOS browser extension to capture conversations with one click.
            </p>
          </div>
        </div>
        {status === "has-key" && !newKey && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <Icons.checkCircle className="h-3.5 w-3.5" />
            Active
          </span>
        )}
      </div>

      <div className="mt-5">
        {status === "loading" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icons.spinner className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        )}

        {status === "error" && (
          <p className="text-sm text-error">Couldn&apos;t load your API key status. Refresh and try again.</p>
        )}

        {/* Freshly generated key — shown once */}
        {newKey && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
              <Icons.alertCircle className="h-4 w-4 shrink-0" />
              Copy this key now — it won&apos;t be shown again.
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg border bg-muted px-3 py-2.5 font-mono text-sm">
                {newKey}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copy}
                title="Copy key"
                className={cn("shrink-0", copied && "border-success/40 text-success")}
              >
                {copied ? <Icons.check className="h-4 w-4" /> : <Icons.copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* No key yet */}
        {status === "no-key" && !newKey && (
          <Button onClick={generate} disabled={working}>
            {working ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.plus className="mr-2 h-4 w-4" />
            )}
            Generate API Key
          </Button>
        )}

        {/* Key exists (not just generated) */}
        {status === "has-key" && !newKey && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your API key is active. For security the key is hidden — if you&apos;ve lost it,
              regenerate a new one (this invalidates the old key).
            </p>
            <Button variant="outline" onClick={generate} disabled={working}>
              {working ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.zap className="mr-2 h-4 w-4" />
              )}
              Regenerate Key
            </Button>
          </div>
        )}
      </div>

      {/* Connect steps */}
      <div className="mt-6 rounded-lg border border-dashed bg-muted/30 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Connect the extension
        </p>
        <ol className="space-y-1.5 text-sm text-muted-foreground">
          <li>1. Click the RelayOS icon in your browser toolbar</li>
          <li>
            2. Set the RelayOS URL and paste your API key, then click{" "}
            <span className="font-medium text-foreground">Connect</span>
          </li>
          <li>3. Open a chat on Claude / ChatGPT / Gemini and click Capture</li>
        </ol>
      </div>
    </div>
  )
}
