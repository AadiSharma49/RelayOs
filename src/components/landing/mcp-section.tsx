"use client"

import * as React from "react"
import { Icons } from "@/lib/icons"
import { AnimatedSection } from "./animated-section"

/**
 * Surfaces the (already built) MCP server: RelayOS plugs into Claude Code,
 * Cursor and other AI coding tools so your assistant can read your past
 * decisions while you work. This is the strongest angle for technical users.
 */

const CLIENTS = ["Claude Code", "Cursor", "Windsurf", "VS Code"]

export function MCPSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <AnimatedSection>
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                <Icons.plug className="h-3.5 w-3.5 text-primary" />
                For developers
              </div>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Your AI reads your decisions <span className="text-primary">while you code</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                RelayOS runs as an MCP server. Point Claude Code, Cursor or any MCP client at it, and
                your assistant can search your past decisions, action items and open questions —
                right inside your editor, mid-task.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {CLIENTS.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border bg-card/50 px-3 py-1 text-sm text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            {/* Illustrative example of the MCP tool answering from your memory */}
            <div className="glass-card overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-error/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                </div>
                <span className="ml-1 font-mono text-xs text-muted-foreground">cursor · agent</span>
              </div>
              <div className="space-y-4 p-5 text-sm">
                <div>
                  <p className="mb-1 font-mono text-xs text-muted-foreground">you</p>
                  <p className="rounded-lg bg-muted/60 px-3 py-2">
                    what did we decide about auth?
                  </p>
                </div>
                <div>
                  <p className="mb-1 flex items-center gap-1.5 font-mono text-xs text-primary">
                    <Icons.plug className="h-3 w-3" /> relayos · search_decisions
                  </p>
                  <div className="rounded-lg border bg-background/60 px-3 py-2">
                    <p className="font-medium">Handle authentication with Clerk</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Chosen over rolling our own — social login + sessions out of the box.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
