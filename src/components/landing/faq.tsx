"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icons } from "@/lib/icons"
import { AnimatedSection } from "./animated-section"

const FAQS = [
  {
    q: "What makes RelayOS different from AI chat memory?",
    a: "AI chat memory is session-level and fragmented. RelayOS is a structured decision memory layer that works across all your AI tools — ChatGPT, Claude, Cursor, and more. It extracts, organizes, and connects decisions so you can search, revisit, and reuse them across projects and teams."
  },
  {
    q: "Can RelayOS work with ChatGPT, Claude, and Cursor?",
    a: "Yes. RelayOS connects to ChatGPT, Claude, Gemini, Cursor, Notion, Discord, and more. Conversations are automatically imported and processed through our Decision Extraction pipeline to identify key decisions, reasoning, and action items."
  },
  {
    q: "How does Decision Extraction work?",
    a: "When a conversation is imported, our AI analyzes the dialogue to identify decision points, alternatives considered, supporting rationale, and outcomes. Each decision is then stored with metadata, relationships to other decisions, and full context — making it searchable and reusable."
  },
  {
    q: "Can teams collaborate inside RelayOS?",
    a: "Absolutely. RelayOS is built for teams. Decisions can be shared, annotated, and linked across workspaces. Team members can search the collective decision history, follow decision threads, and ensure everyone stays aligned on key choices."
  },
  {
    q: "Is my data private?",
    a: "Privacy is core to RelayOS. Your data is encrypted at rest and in transit. We never train on your data. Enterprise-grade security with SOC 2 compliance, role-based access controls, and the ability to self-host on your own infrastructure."
  },
  {
    q: "What is the long-term vision of RelayOS?",
    a: "We're building the universal memory layer for human and AI decisions. Future capabilities include autonomous agents that proactively surface relevant decisions, AI-powered decision impact analysis, and deep integrations with project management, documentation, and code review tools."
  }
]

function AccordionItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors pr-4">{q}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <Icons.chevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  return (
    <section id="faq" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Want to Learn More?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Here are answers to common questions.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                q={faq.q}
                a={faq.a}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}