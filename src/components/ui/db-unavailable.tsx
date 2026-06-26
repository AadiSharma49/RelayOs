import { Icons } from "@/lib/icons"

export function DbUnavailable() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/20">
          <Icons.alertCircle className="h-8 w-8 text-warning" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Database Connection</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Unable to connect to the database. Please check your connection
          settings and try again.
        </p>
      </div>
    </div>
  )
}