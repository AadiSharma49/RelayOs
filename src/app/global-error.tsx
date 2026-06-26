"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold">500</h1>
          <h2 className="mt-2 text-xl font-semibold">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error.message || "An unexpected error occurred"}
          </p>
        </div>
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
      </body>
    </html>
  )
}