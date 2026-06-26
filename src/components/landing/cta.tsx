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
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 60, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 sm:p-16">
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Capture Your{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Most Important Decisions
                </span>
                ?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start using RelayOS today to keep every decision organized and
                accessible.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <Button size="xl" className="group">
                      <Icons.dashboard className="mr-2 h-5 w-5" />
                      Open Dashboard
                      <Icons.arrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/sign-up">
                    <Button size="xl" className="group">
                      Start Free Trial
                      <Icons.arrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}