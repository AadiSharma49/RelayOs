import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

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
export function MemoryChatSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-4 px-8 py-6 border-b">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="ml-auto h-5 w-16 rounded-full" />
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-[900px] space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-start">
              {i % 3 === 0 ? (
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              ) : (
                <div className="w-8 shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <Skeleton className={cn("h-4", i === 0 ? "w-3/4" : i === 1 ? "w-1/2" : "w-5/6")} />
                <Skeleton className={cn("h-4", i === 2 ? "w-2/3" : "w-1/3")} />
                {i % 3 === 0 && <Skeleton className="h-3 w-1/4 mt-2" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export function ConversationSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
      <div className="rounded-xl border bg-card p-6">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-1.5">
              <Skeleton className="h-7 w-7 rounded-full shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  )
}
export function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center"
        >
          <span className="text-3xl">🔮</span>
        </motion.div>
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">Loading your workspace...</p>
          <p className="text-sm text-muted-foreground">Preparing your decision intelligence platform</p>
        </div>
      </div>
    </div>
  )
}