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
      {/* Background orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
      </div>

      <div className="w-full mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASING }}
          className="text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-balance"
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
          className="mt-8"
        >
          {isSignedIn ? (
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-base">
                Open Dashboard
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-8 text-base">
                Get Started Free
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </motion.div>

        <EcosystemLogos />
      </div>
    </section>
  )
}
