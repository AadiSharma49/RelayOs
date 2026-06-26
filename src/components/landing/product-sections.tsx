"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { PRODUCT_SECTIONS } from "@/lib/constants"
import { Icons } from "@/lib/icons"
import { AnimatedSection } from "./animated-section"
import type { Icon } from "@/lib/icons"

const iconMap: Record<string, Icon> = {
  MessageSquare: Icons.messageSquare,
  GitBranch: Icons.gitBranch,
  Brain: Icons.brain,
  BarChart3: Icons.barChart,
  FolderKanban: Icons.folderKanban,
  Search: Icons.search,
  Zap: Icons.zap,
  Users: Icons.users,
  Lightbulb: Icons.lightbulb,
}

const COLORS = [
  "from-blue-500/10 to-blue-500/5",
  "from-emerald-500/10 to-emerald-500/5",
  "from-amber-500/10 to-amber-500/5",
  "from-purple-500/10 to-purple-500/5",
  "from-rose-500/10 to-rose-500/5",
  "from-cyan-500/10 to-cyan-500/5",
  "from-yellow-500/10 to-yellow-500/5",
  "from-violet-500/10 to-violet-500/5",
  "from-indigo-500/10 to-indigo-500/5",
]

const DOT_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-yellow-500",
  "bg-violet-500",
  "bg-indigo-500",
]

function MockupUI({ section, index }: { section: typeof PRODUCT_SECTIONS[number]; index: number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${COLORS[index]}`}>
          {(() => {
            const Icon = iconMap[section.icon]
            return Icon ? <Icon className="h-6 w-6 text-foreground" /> : null
          })()}
        </div>
        <div>
          <h4 className="font-semibold">{section.title}</h4>
          <p className="text-sm text-muted-foreground">{section.subtitle}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {section.features.map((f) => (
          <div key={f} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs">
            <div className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[index]}`} />
            {f}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function ProblemSection() {
  return (
    <AnimatedSection>
      <div id="features" className="mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-destructive/10 px-4 py-1.5 text-sm text-destructive">
          <Icons.alertCircle className="h-4 w-4" />
          The Problem
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Decisions Get Lost in{" "}
          <span className="text-destructive">Endless Conversations</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Your team makes hundreds of decisions across ChatGPT, Claude, Slack, and meetings.
          None of them are captured. Context is lost. Teams repeat work. Knowledge walks out the door.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { stat: "73%", label: "of decisions are never documented" },
            { stat: "4.2h", label: "avg. time lost finding past context" },
            { stat: "2.3x", label: "more likely to repeat past work" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border bg-card p-4">
              <p className="text-3xl font-bold text-destructive">{item.stat}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

export function ProductSections() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ProblemSection />

        <div className="mt-24 space-y-32">
          {PRODUCT_SECTIONS.map((section, i) => (
            <AnimatedSection key={section.id}>
              <div className={`grid gap-12 lg:grid-cols-2 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-primary/10 px-4 py-1.5 text-sm text-primary">
                    {(() => {
                      const Icon = iconMap[section.icon]
                      return Icon ? <Icon className="h-4 w-4" /> : null
                    })()}
                    {section.title}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {section.subtitle}
                  </h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {section.features.map((f) => (
                      <span key={f} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                        <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[i]}`} />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <MockupUI section={section} index={i} />
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}