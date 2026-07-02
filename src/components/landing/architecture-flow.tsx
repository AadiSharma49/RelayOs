"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Icons, type Icon } from "@/lib/icons"

interface SourceItem {
  icon: Icon
  label: string
  target: number
  suffix: string
  accent: string
  delay: number
}

const SOURCES: SourceItem[] = [
  {
    icon: Icons.messageSquare,
    label: "Conversations",
    target: 24,
    suffix: "imported",
    accent: "from-blue-500/25 to-blue-500/5 text-blue-500",
    delay: 0,
  },
  {
    icon: Icons.gitBranch,
    label: "Decisions",
    target: 47,
    suffix: "extracted",
    accent: "from-violet-500/25 to-violet-500/5 text-violet-500",
    delay: 120,
  },
  {
    icon: Icons.checkCircle,
    label: "Action Items",
    target: 89,
    suffix: "tracked",
    accent: "from-emerald-500/25 to-emerald-500/5 text-emerald-500",
    delay: 240,
  },
  {
    icon: Icons.helpCircle,
    label: "Questions",
    target: 12,
    suffix: "open",
    accent: "from-amber-500/25 to-amber-500/5 text-amber-500",
    delay: 360,
  },
]

/** Count 0 -> target on activation, then drift up slowly for a "live" feel. */
function useLiveCount(target: number, active: boolean, delayMs = 0): number {
  const [value, setValue] = React.useState(0)

  React.useEffect(() => {
    if (!active) return
    let raf = 0
    let done = false
    const duration = 1300
    const begin = performance.now() + delayMs

    const tick = (now: number) => {
      if (now < begin) {
        raf = requestAnimationFrame(tick)
        return
      }
      const p = Math.min(1, (now - begin) / duration)
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
      else done = true
    }
    raf = requestAnimationFrame(tick)

    const drift = setInterval(() => {
      if (done && Math.random() < 0.5) setValue((v) => v + 1)
    }, 3000)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(drift)
    }
  }, [target, active, delayMs])

  return value
}

function ContainerLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -top-3 left-5 rounded-md border border-border/60 bg-card px-2 py-0.5 font-heading text-xs font-medium text-foreground">
      {children}
    </span>
  )
}

function SourceCard({ item, active }: { item: SourceItem; active: boolean }) {
  const Icon = item.icon
  const count = useLiveCount(item.target, active, item.delay)
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background/80 px-2.5 py-2">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${item.accent}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-tight">{item.label}</p>
        <p className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {count.toLocaleString()} {item.suffix}
        </p>
      </div>
    </div>
  )
}

function FlowBox({
  title,
  subtitle,
  scaling,
}: {
  title: string
  subtitle: string
  scaling?: boolean
}) {
  return (
    <div className="relative min-w-0 flex-1 rounded-lg border border-primary/30 bg-background/80 px-3 py-4 text-center">
      {scaling && (
        <span className="absolute -top-2 right-2 animate-pulse font-mono text-[9px] text-primary/70">
          scaling…
        </span>
      )}
      <p className="truncate text-xs font-semibold">{title}</p>
      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function CloudCard({ icon: Icon, label, sub }: { icon: Icon; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-primary/30 bg-background/80 px-3 py-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  )
}

/** Dashed animated connector — horizontal on the given breakpoint, vertical below it. */
function Connector({ size = "w-6" }: { size?: string }) {
  return (
    <div className="flex shrink-0 items-center justify-center">
      <div className={`pipeline-connector-h hidden sm:block ${size}`} />
      <div className="pipeline-connector-v h-5 sm:hidden" />
    </div>
  )
}

export function ArchitectureFlow() {
  const ref = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setActive(true), {
      threshold: 0.25,
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm sm:p-10"
    >
      {/* Dotted technical grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, var(--tw-bd) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Header */}
      <div className="relative mb-8 flex items-center justify-end gap-2 text-sm font-medium text-muted-foreground">
        <span className="font-heading">RelayOS Architecture</span>
        <Icons.arrowRight className="h-4 w-4" />
      </div>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-stretch">
        {/* LEFT — Your Workspace */}
        <div className="relative flex-1 rounded-2xl border border-border/60 bg-background/40 p-5 pt-8">
          <ContainerLabel>Your Workspace</ContainerLabel>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={active ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="shrink-0 space-y-2 rounded-xl border border-border/60 bg-card/60 p-3 sm:w-52"
            >
              {SOURCES.map((item) => (
                <SourceCard key={item.label} item={item} active={active} />
              ))}
            </motion.div>

            <Connector />

            <div className="flex flex-1 items-center gap-3">
              <FlowBox title="Capture" subtitle="Import · Extension" />
              <Connector size="w-4" />
              <FlowBox title="AI Extraction" subtitle="Gemini engine" scaling />
            </div>
          </div>
        </div>

        {/* MIDDLE — Encrypted sync */}
        <div className="relative flex shrink-0 flex-col items-center justify-center gap-2 lg:w-44">
          <span className="text-center font-heading text-xs font-medium text-muted-foreground">
            Encrypted Sync
          </span>
          <div className="flex w-full items-center gap-2">
            <div className="pipeline-connector-h hidden flex-1 lg:block" />
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
              <Icons.shield className="h-5 w-5 text-foreground" />
            </div>
            <div className="pipeline-connector-h hidden flex-1 lg:block" />
          </div>
          <span className="text-center text-xs text-muted-foreground">
            Your data stays private
          </span>
          <div className="pipeline-connector-v h-6 lg:hidden" />
        </div>

        {/* RIGHT — RelayOS Cloud */}
        <div className="relative rounded-2xl border border-border/60 bg-background/40 p-5 pt-8 lg:w-64">
          <ContainerLabel>RelayOS Cloud</ContainerLabel>
          <div className="space-y-3">
            <CloudCard icon={Icons.brain} label="Memory Chat" sub="Ask, get cited answers" />
            <CloudCard icon={Icons.search} label="Search & Dashboard" sub="Find anything, instantly" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArchitectureFlow
