"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AIProvidersSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Providers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure and monitor AI provider connections
        </p>
      </div>

      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          AI provider settings are being updated. Check back soon.
        </p>
      </Card>
    </div>
  )
}