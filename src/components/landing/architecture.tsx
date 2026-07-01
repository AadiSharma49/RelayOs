"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Icons } from "@/lib/icons"
import { AnimatedSection } from "./animated-section"

const STEPS = [
  {
    icon: Icons.fileText,
    title: "Conversation Import",
    description: "Paste text from any AI tool",
  },
  {
    icon: Icons.gitBranch,
    title: "Decision Extraction",
    description: "AI identifies decisions, action items, and questions",
  },
  {
    icon: Icons.checkCircle,
    title: "Decision Memory",
    description: "Review and approve what matters",
  },
  {
    icon: Icons.search,
    title: "Decision Search",
    description: "Find anything across all items",
  },
]

export function ArchitectureSection() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Four steps from raw conversation to organized knowledge.
            </p>
          </div>
        </AnimatedSection>

        <div className="relative mt-16">
          <AnimatedSection delay={0.2}>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 relative">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.15,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  className="relative"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex h-10 w-10 items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
                      <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                        {i + 1}
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <step.icon className="h-4 w-4 text-foreground" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-primary/40 to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
