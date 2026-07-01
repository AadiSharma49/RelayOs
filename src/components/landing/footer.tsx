import Link from "next/link"
import { APP_NAME } from "@/lib/constants"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">R</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/sign-in" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:text-foreground transition-colors">
              Sign Up
            </Link>
            <span className="text-muted">
              © {new Date().getFullYear()} {APP_NAME}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
