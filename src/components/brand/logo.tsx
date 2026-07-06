"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * RelayOS logo.
 *
 * `LogoMark` — the icon tile (a geometric "R" with a relay-node accent on its
 * leg, nodding to the "Relay" name) on the violet brand gradient.
 * `Logo` — the mark plus the "RelayOS" wordmark (Space Grotesk heading font).
 *
 * Pure SVG so it stays razor-sharp at every size, from a 16px favicon to a hero.
 */

export function LogoMark({
  size = 28,
  className,
}: {
  size?: number
  className?: string
}) {
  const id = React.useId()
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="RelayOS"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>

      {/* tile */}
      <rect width="512" height="512" rx="120" fill={`url(#${id}-g)`} />

      {/* R glyph */}
      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="58"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* stem */}
        <path d="M180 140 V372" />
        {/* bowl */}
        <path d="M180 140 H255 a66 66 0 0 1 0 132 H180" />
        {/* leg */}
        <path d="M232 272 L338 372" />
      </g>

      {/* relay node on the leg terminus */}
      <circle cx="338" cy="372" r="33" fill="#ffffff" />
      <circle cx="338" cy="372" r="13" fill={`url(#${id}-g)`} />
    </svg>
  )
}

export function Logo({
  size = 28,
  className,
  wordmark = true,
}: {
  size?: number
  className?: string
  wordmark?: boolean
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} className="shadow-md shadow-primary/30 rounded-[22%]" />
      {wordmark && (
        <span className="font-heading text-sm font-semibold tracking-tight">
          Relay<span className="text-primary">OS</span>
        </span>
      )}
    </span>
  )
}

export default Logo
