"use client"

import * as React from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"

// Lazy, client-only — the animated background never blocks first paint.
const AuroraBackground = dynamic(
  () => import("@/components/ui/aurora-background").then((m) => m.AuroraBackground),
  { ssr: false }
)
import {
  SiOpenai,
  SiAnthropic,
  SiGooglegemini,
  SiGithub,
  SiNotion,
  SiSlack,
  SiDiscord,
} from "react-icons/si"
import { VscVscode } from "react-icons/vsc"

const EASING = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number]

function EcosystemLogos() {
  const logos = [
    { icon: SiOpenai, name: "OpenAI", color: "text-emerald-500" },
    { icon: SiAnthropic, name: "Anthropic", color: "text-amber-500" },
    { icon: SiGooglegemini, name: "Gemini", color: "text-blue-500" },
    { icon: SiGithub, name: "GitHub", color: "text-gray-300" },
    { icon: SiNotion, name: "Notion", color: "text-gray-200" },
    { icon: SiSlack, name: "Slack", color: "text-pink-500" },
    { icon: SiDiscord, name: "Discord", color: "text-indigo-400" },
    { icon: VscVscode, name: "VS Code", color: "text-sky-400" },
  ]

  const allLogos = [...logos, ...logos]

  return (
    <div className="relative overflow-hidden mt-16">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />

      <div className="flex animate-marquee whitespace-nowrap">
        {allLogos.map((logo, idx) => {
          const Icon = logo.icon
          return (
            <div
              key={logo.name + idx}
              className="flex items-center justify-center mx-8 transition-all duration-300 hover:scale-110"
            >
              <Icon
                className={`h-7 w-7 ${logo.color} opacity-70 transition-all duration-300 hover:opacity-100 hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]`}
                title={logo.name}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Hero() {
  const { isSignedIn } = useUser()

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      {/* Animated aurora background (lazy, GPU-composited) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <AuroraBackground className="h-full w-full" intensity={0.55} />
      </div>

      {/* Floating glass objects (desktop only, decorative) */}
      <div className="pointer-events-none absolute inset-0 -z-10 hidden lg:block">
        <motion.div
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="glass-card absolute left-[7%] top-[30%] flex h-14 w-14 items-center justify-center rounded-2xl"
        >
          <Icons.messageSquare className="h-6 w-6 text-blue-400" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="glass-card absolute right-[9%] top-[26%] flex h-14 w-14 items-center justify-center rounded-2xl"
        >
          <Icons.gitBranch className="h-6 w-6 text-violet-400" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="glass-card absolute bottom-[24%] left-[13%] flex h-12 w-12 items-center justify-center rounded-xl"
        >
          <Icons.checkCircle className="h-5 w-5 text-emerald-400" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="glass-card absolute bottom-[28%] right-[12%] flex h-12 w-12 items-center justify-center rounded-xl"
        >
          <Icons.search className="h-5 w-5 text-amber-400" />
        </motion.div>
      </div>

      <div className="w-full mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASING }}
          className="glass-panel mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          New · One-click browser capture
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASING }}
          className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-balance"
        >
          Your AI conversations are full of decisions.
          <br />
          <span className="text-gradient-hero">Stop losing them.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: EASING }}
          className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground"
        >
          RelayOS captures decisions, action items, and questions from your AI chats — and makes them searchable forever.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: EASING }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
            <Button
              size="lg"
              className="group h-12 border-0 bg-linear-to-r from-primary to-violet-500 px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40"
            >
              {isSignedIn ? "Open Dashboard" : "Get Started Free"}
              <Icons.arrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button
              size="lg"
              variant="outline"
              className="glass-panel h-12 border-0 px-6 text-base font-medium"
            >
              See how it works
            </Button>
          </Link>
        </motion.div>

        <EcosystemLogos />
      </div>
    </section>
  )
}
