import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
  variant?: "spinner" | "skeleton" | "page"
}

export function Loading({ className, variant = "spinner" }: LoadingProps) {
  if (variant === "page") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "mx-auto h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent",
        className
      )}
    />
  )
}

export function PageLoading() {
  return <Loading variant="page" />
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="space-y-4">
        <div className="h-4 w-1/3 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-1/2 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}