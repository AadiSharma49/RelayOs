"use client"

import { AnimatedSection } from "./animated-section"
import { ArchitectureFlow } from "./architecture-flow"

export function ArchitectureSection() {
  return (
    <section id="architecture" className="relative overflow-hidden pb-24 sm:pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Under the hood
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The same flow, as a live architecture view — your data stays yours.
            </p>
          </div>
        </AnimatedSection>

        <div className="relative mt-16">
          <AnimatedSection delay={0.15}>
            <ArchitectureFlow />
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
