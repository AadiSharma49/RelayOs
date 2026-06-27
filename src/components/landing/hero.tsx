"use client"

import * as React from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import {
  SiOpenai,
  SiAnthropic,
  SiGooglegemini,
  SiGithub,
  SiNotion,
  SiSlack,
  SiDiscord,
} from "react-icons/si";

import { VscVscode } from "react-icons/vsc";
const EASING = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number]

/* ── Trust indicator logos (small, gray, no text) ── */
function TrustLogos() {
  const logos = [
    { icon: SiOpenai, name: "OpenAI" },
    { icon: SiAnthropic, name: "Anthropic" },
    { icon: SiGooglegemini, name: "Gemini" },
    { icon: SiGithub, name: "GitHub" },
    { icon: SiNotion, name: "Notion" },
    { icon: SiSlack, name: "Slack" },
    { icon: SiDiscord, name: "Discord" },
     { icon: VscVscode, name: "VS Code" },
  ];

  // Duplicate for seamless looping
  const allLogos = [...logos, ...logos];

  return (
    <div className="relative overflow-hidden">
      {/* Fade masks on edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white dark:from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white dark:from-black to-transparent" />

      {/* Animated marquee */}
      <div className="flex animate-marquee whitespace-nowrap">
        {allLogos.map((logo, idx) => {
          const Icon = logo.icon;
          return (
            <div key={logo.name + idx} className="flex items-center justify-center mx-6">
              <Icon
                className="h-8 w-8 opacity-100 grayscale dark:opacity-[0.65] dark:grayscale-0 dark:drop-shadow-md transition-all duration-300 hover:opacity-100 hover:scale-110 hover:grayscale-0"
                title={logo.name}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Hero() {
  const { isSignedIn } = useUser()

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
      {/* Sunrise light mode effects */}
      <div className="sunrise-glow" />
      <div className="sunrise-horizon" />

      {/* Subtle grid */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg className="absolute inset-0 h-full w-full opacity-[0.015] dark:opacity-[0.03]">
          <defs>
            <pattern id="gh" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M 64 0 L 0 0 0 64" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gh)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASING }}
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-xs sm:text-sm backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-muted-foreground">The Memory Layer for Human and AI Decisions</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASING }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight"
          >
            Remember Every
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Important Decision
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: EASING }}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            RelayOS captures, organizes, and explains decisions across projects
            so teams never lose context.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease: EASING }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            {isSignedIn ? (
              <>
                <Link href="/dashboard">
                  <Button size="xl" className="glow-cta magnetic-btn cursor-pointer group text-sm sm:text-base h-12 px-8">
                    <Icons.dashboard className="mr-2 h-5 w-5" />
                    Open Dashboard
                    <Icons.arrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/dashboard/workspaces">
                  <Button variant="outline" size="xl" className="magnetic-btn cursor-pointer text-sm sm:text-base h-12 px-8">
                    <Icons.plus className="mr-2 h-5 w-5" />
                    Create Workspace
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button size="xl" className="glow-cta magnetic-btn cursor-pointer group text-sm sm:text-base h-12 px-8">
                    Get Started Free
                    <Icons.arrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="xl" className="magnetic-btn cursor-pointer text-sm sm:text-base h-12 px-8">
                    How It Works
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.2, ease: EASING }}
            className="mt-25"
          >
            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest">WORKS WITH YOUR AI ECOSYSTEM</p>
            <TrustLogos />
          </motion.div>
        </div>
      </div>
    </section>
  )
}