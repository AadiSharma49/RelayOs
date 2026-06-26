import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Insights",
  description: "AI-powered insights and recommendations",
}

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">
          AI-powered insights and recommendations for your business.
        </p>
      </div>

      <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Insights Coming Soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            AI-powered insights will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  )
}