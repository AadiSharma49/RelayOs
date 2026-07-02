"use client"

import { motion } from "framer-motion"
import { USE_CASES } from "@/lib/constants"
import { Icons } from "@/lib/icons"
import { AnimatedSection } from "./animated-section"
import type { Icon } from "@/lib/icons"

const iconMap: Record<string, Icon> = {
  Lightbulb: Icons.lightbulb,
  Zap: Icons.zap,
  Users: Icons.users,
  Search: Icons.search,
}

const BORDER_CLASSES = [
  "use-case-border-blue",
  "use-case-border-purple",
  "use-case-border-orange",
  "use-case-border-green",
] as const

const ICON_GLOW_CLASSES = [
  "icon-glow-blue",
  "icon-glow-purple",
  "icon-glow-orange",
  "icon-glow-green",
] as const

const COLORS = [
  "from-blue-500/10 to-blue-500/5",
  "from-violet-500/10 to-violet-500/5",
  "from-amber-500/10 to-amber-500/5",
  "from-emerald-500/10 to-emerald-500/5",
]

export function UseCasesSection() {
  return (
    <section id="use-cases" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Built for teams that make decisions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              If your team uses AI, RelayOS is for you.
            </p>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((uc, i) => {
              const Icon = iconMap[uc.icon]
              return (
                <motion.div
                  key={uc.title}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-md ${BORDER_CLASSES[i]}`}
                >
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${COLORS[i]}`}>
                    {Icon && <Icon className={`h-5 w-5 text-foreground ${ICON_GLOW_CLASSES[i]}`} />}
                  </div>
                  <h3 className="text-base font-semibold">{uc.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {uc.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
