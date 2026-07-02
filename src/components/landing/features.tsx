"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { FEATURES } from "@/lib/constants"
import { Icons } from "@/lib/icons"
import type { Icon } from "@/lib/icons"
import { AnimatedSection } from "./animated-section"

const iconMap: Record<string, Icon> = {
  MessageSquare: Icons.messageSquare,
  GitBranch: Icons.gitBranch,
  CheckCircle: Icons.checkCircle,
  Search: Icons.search,
  FolderKanban: Icons.folderKanban,
  BarChart3: Icons.barChart,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
    },
  },
}

const iconColors: Record<string, string> = {
  MessageSquare: "from-blue-500/20 to-blue-500/5",
  GitBranch: "from-violet-500/20 to-violet-500/5",
  CheckCircle: "from-emerald-500/20 to-emerald-500/5",
  Search: "from-amber-500/20 to-amber-500/5",
  FolderKanban: "from-cyan-500/20 to-cyan-500/5",
  BarChart3: "from-rose-500/20 to-rose-500/5",
}

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Built for how you actually work
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Import, extract, and search decisions from your AI conversations.
            </p>
          </div>
        </AnimatedSection>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon]
            const gradientClass = iconColors[feature.icon] || "from-primary/20 to-primary/5"
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="glass-card group relative overflow-hidden p-6"
              >
                <div className={`absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br ${gradientClass} blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0`} />
                <div className="relative">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {Icon && <Icon className="h-5 w-5 text-foreground" />}
                  </div>
                  <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
