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

const COLORS = [
  "from-yellow-500/10 to-yellow-500/5",
  "from-violet-500/10 to-violet-500/5",
  "from-emerald-500/10 to-emerald-500/5",
  "from-blue-500/10 to-blue-500/5",
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
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Who Is{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                RelayOS
              </span>{" "}
              For?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every team that makes decisions — which is every team — benefits from having a memory layer.
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
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="group relative overflow-hidden rounded-2xl border bg-card/50 p-6 transition-all duration-300 hover:bg-card hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${COLORS[i]}`}>
                    {Icon && <Icon className="h-6 w-6 text-foreground" />}
                  </div>
                  <h3 className="text-lg font-semibold">{uc.title}</h3>
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