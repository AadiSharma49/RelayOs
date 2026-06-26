import { NextResponse } from "next/server"
import { getProviderHealth } from "@/lib/ai/providers/registry"

export async function GET() {
  try {
    const health = await getProviderHealth()
    return NextResponse.json(health, { status: health.available ? 200 : 503 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI provider unavailable"
    return NextResponse.json(
      {
        connected: false,
        provider: "unknown",
        model: "unknown",
        lastCheck: new Date().toISOString(),
        available: false,
        error: message,
      },
      { status: 503 }
    )
  }
}