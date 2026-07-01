"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface RelayLoaderProps {
  title?: string
  subtitle?: string
  variant?: "default" | "auth" | "page"
  size?: "sm" | "md" | "lg"
  messages?: string[]
}

const DEFAULT_MESSAGES = [
  "Preparing your workspace...",
  "Loading conversations...",
  "Building memory graph...",
  "Finding decisions...",
  "Syncing AI...",
  "Connecting knowledge...",
  "Almost ready...",
  "Welcome back.",
]

const RELAY_LOGO = (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-full w-full"
  >
    {/* Outer glow circle */}
    <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
    {/* Inner circle */}
    <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2" opacity="0.4" />
    {/* Center dot */}
    <circle cx="32" cy="32" r="4" fill="currentColor" />
    {/* Relay arcs */}
    <path d="M32 12 A20 20 0 0 1 52 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <path d="M32 52 A20 20 0 0 1 12 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    {/* Signal dots */}
    <circle cx="46.5" cy="17.5" r="2.5" fill="currentColor" opacity="0.8" />
    <circle cx="17.5" cy="46.5" r="2.5" fill="currentColor" opacity="0.8" />
  </svg>
)

export function RelayLoader({
  title,
  subtitle,
  variant = "default",
  size = "md",
  messages = DEFAULT_MESSAGES,
}: RelayLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 900)
    return () => clearInterval(interval)
  }, [messages.length])

  const logoSize = size === "sm" ? "h-12 w-12" : size === "lg" ? "h-24 w-24" : "h-16 w-16"

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "var(--tw-bg)",
      }}
    >
      {/* Subtle animated grid background */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />

      {/* Subtle radial gradient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(96, 165, 250, 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Logo with scale breathing animation */}
      <motion.div
        className={`relative ${logoSize} text-primary`}
        animate={{
          scale: [0.96, 1.03, 0.96],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {RELAY_LOGO}

        {/* Animated glow around logo */}
        <motion.div
          className="absolute inset-0 -m-4 rounded-full"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background:
              "radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%)",
            filter: "blur(12px)",
          }}
        />
      </motion.div>

      {/* Title */}
      <div className="mt-8 text-center" aria-live="polite">
        {title && (
          <motion.p
            key={title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-semibold text-foreground"
          >
            {title}
          </motion.p>
        )}
        {subtitle && (
          <motion.p
            key={subtitle}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-muted-foreground"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Rotating messages */}
      <div className="mt-6 h-6 relative">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 text-sm text-muted-foreground/70 text-center"
          >
            {messages[messageIndex] || messages[0]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Animated progress bar */}
      <div className="mt-8 h-[3px] w-48 rounded-full overflow-hidden bg-muted/30">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ width: "50%" }}
        />
      </div>
    </div>
  )
}