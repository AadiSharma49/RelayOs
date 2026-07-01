"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Icons } from "@/lib/icons"
import { AnimatedSection } from "./animated-section"

const FLOW = [
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

export function FlowDiagram() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mt-16 overflow-x-auto">
            <div className="flex min-w-[600px] items-center justify-between gap-4">
              {FLOW.map((node, i) => (
                <React.Fragment key={node.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.15,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                    className="flow-node flex-1 p-5 text-center"
                  >
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <node.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <h3 className="text-sm font-semibold">{node.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {node.description}
                    </p>
                  </motion.div>
                  {i < FLOW.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.15 + 0.2 }}
                      className="hidden sm:block h-px flex-1 bg-gradient-to-r from-primary/40 to-primary/10 origin-left"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
