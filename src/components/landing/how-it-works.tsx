"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Icons, type Icon } from "@/lib/icons"
import { AnimatedSection } from "./animated-section"

/**
 * "How it works" as a plain-language, 4-step story. Each step spells out both
 * WHAT happens (the how) and WHY it matters (the payoff), so a first-time
 * visitor understands the value without needing to read the architecture.
 */

interface Step {
  icon: Icon
  title: string
  how: string
  why: string
  accent: string
}

const STEPS: Step[] = [
  {
    icon: Icons.messageSquare,
    title: "You capture a conversation",
    how: "One click with the browser extension — or paste / import — grabs your ChatGPT, Claude or Gemini chat.",
    why: "The thinking you just did with AI is saved, instead of scrolling away under 40 other chats.",
    accent: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: Icons.gitBranch,
    title: "AI pulls out what matters",
    how: "RelayOS reads the conversation and extracts the decisions, action items, and open questions inside it.",
    why: "You keep the actual choices you made — not a wall of text you'll never scroll back through.",
    accent: "text-violet-500 bg-violet-500/10",
  },
  {
    icon: Icons.brain,
    title: "It becomes searchable memory",
    how: "Every decision gets a “meaning fingerprint,” so you can search by idea instead of exact words.",
    why: "Weeks later, “why did we pick our database?” finds the right decision — even if you never typed those words.",
    accent: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: Icons.zap,
    title: "It comes back when you need it",
    how: "Search it anytime, let Claude and Cursor read it live through the MCP server, and get warned when a new decision contradicts an old one.",
    why: "Your past decisions show up right when you're about to need them — even inside the AI tools you already use.",
    accent: "text-amber-500 bg-amber-500/10",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Four steps from a messy chat to memory that works for you.
            </p>
          </div>
        </AnimatedSection>

        <div className="relative mt-16">
          {/* connecting rail */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-border via-border to-transparent sm:left-[23px]" />

          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="relative flex gap-5"
              >
                {/* node */}
                <div className="relative z-10 shrink-0">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${step.accent}`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                </div>

                {/* content */}
                <div className="glass-card flex-1 p-5 sm:p-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-xs font-semibold text-muted-foreground">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-1 font-heading text-lg font-semibold tracking-tight">{step.title}</h3>

                  <div className="mt-3 space-y-2.5 text-sm leading-relaxed">
                    <p className="flex gap-2 text-muted-foreground">
                      <span className="mt-px shrink-0 font-medium text-foreground">How</span>
                      <span>{step.how}</span>
                    </p>
                    <p className="flex gap-2">
                      <span className="mt-px shrink-0 font-medium text-primary">Why</span>
                      <span className="text-muted-foreground">{step.why}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
