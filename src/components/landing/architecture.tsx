"use client"

import { AnimatedSection } from "./animated-section"
import { ArchitectureFlow } from "./architecture-flow"

export function ArchitectureSection() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Watch a conversation turn into structured, searchable memory — live.
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
