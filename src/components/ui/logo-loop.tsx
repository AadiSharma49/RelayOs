"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LogoItem {
  component: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  color?: string
}

interface LogoLoopProps {
  items: LogoItem[]
  speed?: number
  gap?: number
  logoHeight?: number
  className?: string
}

export function LogoLoop({
  items,
  speed = 90,
  gap = 64,
  logoHeight = 36,
  className,
}: LogoLoopProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = React.useState(false)

  const duration = items.length * speed
  const totalWidth = items.length * (logoHeight + gap)
  const doubled = [...items, ...items]

  // Pause/resume via CSS animation-play-state
  React.useEffect(() => {
    if (!trackRef.current) return
    trackRef.current.style.animationPlayState = isPaused ? "paused" : "running"
  }, [isPaused])

  // Respect prefers-reduced-motion
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches && trackRef.current) {
      trackRef.current.style.animation = "none"
    }
  }, [])

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="list"
      aria-label="Supported AI tools and platforms"
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

      <div
        ref={trackRef}
        className="flex"
        style={{
          gap: `${gap}px`,
          animation: `logo-scroll ${duration}ms linear infinite`,
          willChange: "transform",
        }}
      >
        {doubled.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="flex shrink-0 items-center justify-center"
            style={{ height: `${logoHeight}px` }}
            role="listitem"
            aria-label={item.label}
          >
            <item.component
              className="h-full w-auto transition-all duration-300"
              style={{ opacity: 0.6 }}
              onMouseEnter={(e) => {
                const t = e.currentTarget
                t.style.opacity = "1"
                t.style.transform = "scale(1.08)"
                if (item.color) {
                  t.style.filter = `drop-shadow(0 0 6px ${item.color}40)`
                  t.style.color = item.color
                }
              }}
              onMouseLeave={(e) => {
                const t = e.currentTarget
                t.style.opacity = "0.6"
                t.style.transform = "scale(1)"
                t.style.filter = "none"
                t.style.color = "currentColor"
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes logo-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${totalWidth}px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-scroll-animate {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}