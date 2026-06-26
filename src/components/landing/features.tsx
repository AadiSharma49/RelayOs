"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { FEATURES } from "@/lib/constants"
import { Icons } from "@/lib/icons"
import type { Icon } from "@/lib/icons"
import { AnimatedSection } from "./animated-section"

const iconMap: Record<string, Icon> = {
  Brain: Icons.brain,
  BarChart3: Icons.barChart,
  Users: Icons.users,
  Shield: Icons.shield,
  Plug: Icons.plug,
  Zap: Icons.zap,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
    },
  },
}

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden py-24 sm:py-32">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Decide Better
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed to help your team make smarter, faster
              decisions.
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
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border bg-card/50 p-6 transition-all duration-500 hover:bg-card hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                  {Icon && <Icon className="h-6 w-6 text-primary" />}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}