"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icons } from "@/lib/icons"
import { AnimatedSection } from "./animated-section"

const FAQS = [
  {
    q: "What does RelayOS do?",
    a: "It captures conversations from AI tools like ChatGPT and Claude, extracts decisions, action items, and questions, and makes them searchable. Think of it as a decision memory layer for your AI chats."
  },
  {
    q: "Isn't this just documentation?",
    a: "No — and that's the point. Documentation is great when it exists, but most decisions never get written down. The reasoning behind why you chose one approach over another usually lives in an AI chat and then disappears. RelayOS captures that reasoning automatically, so you keep the 'why' you'd never open a doc to write."
  },
  {
    q: "Which AI tools does it support?",
    a: "ChatGPT, Claude and Gemini with one-click capture via the browser extension, plus paste or file import from any AI tool. You can also bulk-import your existing ChatGPT or Claude export."
  },
  {
    q: "How does the AI extraction work?",
    a: "After you import a conversation, RelayOS analyzes it and identifies key decisions, action items, and open questions. You review each item before saving, so nothing gets stored without your approval."
  },
  {
    q: "Is my data private?",
    a: "Yes. Your conversations and extracted data are stored in your own PostgreSQL database. We do not train on your data or share it with third parties."
  },
  {
    q: "Do I need to install anything?",
    a: "No — RelayOS is a web app. Sign up, create a workspace, and start capturing. There's also an optional browser extension for one-click capture from ChatGPT, Claude and Gemini."
  },
  {
    q: "What's coming next?",
    a: "Semantic search, the browser extension, conflict detection, and an MCP server that plugs your decisions into Claude and Cursor are already live. Next up: deeper integrations and team features."
  },
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
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Straight answers about what RelayOS does today.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="mt-12 rounded-xl border bg-card p-6 sm:p-8">
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
