"use client"

import * as React from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import { AnimatedSection } from "./animated-section"

export function CTA() {
  const { isSignedIn } = useUser()

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Start capturing decisions today
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Import your first conversation and see what you've been missing.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <div className="cta-gradient-border">
                    <Button size="lg" className="h-12 px-8 text-base border-0">
                      Open Dashboard
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              ) : (
                <Link href="/sign-up">
                  <div className="cta-gradient-border">
                    <Button size="lg" className="h-12 px-8 text-base border-0">
                      Get Started Free
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
