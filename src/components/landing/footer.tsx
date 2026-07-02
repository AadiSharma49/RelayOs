"use client"

import Link from "next/link"
import { APP_NAME } from "@/lib/constants"
import { SettleText } from "@/components/ui/settle-text"

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/sign-in" },
      { label: "Sign Up", href: "/sign-up" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#" },
      { label: "Privacy", href: "/#" },
      { label: "Terms", href: "/#" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/60">
      {/* Settle-in headline — reads clean, lifts on hover */}
      <div className="mx-auto max-w-3xl px-4 pt-20 pb-4 sm:px-6 lg:px-8">
        <SettleText
          text="RelayOS captures decisions, action items, and questions from your AI conversations — and makes them searchable forever."
          highlightWords={["RelayOS", "decisions", "action", "questions", "searchable"]}
          className="font-heading text-center text-2xl font-semibold leading-relaxed tracking-tight sm:text-3xl"
        />
      </div>

      {/* Link columns */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">R</span>
              </div>
              <span className="font-heading text-base font-semibold tracking-tight">{APP_NAME}</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              The memory layer for human and AI decisions.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Built for humans and AI agents.</p>
        </div>
      </div>
    </footer>
  )
}
