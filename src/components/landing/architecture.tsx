"use client"

import * as React from "react"
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  Handle,
  Position,
  Background,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { motion, AnimatePresence } from "framer-motion"
import { Icons } from "@/lib/icons"
import { AnimatedSection } from "./animated-section"

const NODE_W = 220
const ROW = 140
const CX = 350

const initialNodes = [
  { id: "import", type: "processNode", position: { x: CX - NODE_W / 2, y: 0 }, data: { label: "Conversation Import", description: "Ingest conversations from ChatGPT, Claude, Gemini, Cursor, Notion, Discord", icon: "messageSquare" } },
  { id: "extraction", type: "processNode", position: { x: CX - NODE_W / 2, y: ROW }, data: { label: "Decision Extraction", description: "AI identifies key decisions, action items, and rationale", icon: "gitBranch" } },
  { id: "memory", type: "processNode", position: { x: CX - NODE_W / 2, y: ROW * 2 }, data: { label: "Decision Memory", description: "Stores decisions, reasons, alternatives, and historical context", icon: "brain" } },
  { id: "knowledge", type: "processNode", position: { x: CX - NODE_W / 2 - 160, y: ROW * 3 }, data: { label: "Knowledge Graph", description: "Maps relationships between decisions across projects", icon: "barChart" } },
  { id: "search", type: "processNode", position: { x: CX - NODE_W / 2 + 160, y: ROW * 3 }, data: { label: "Decision Search", description: "Natural language queries across your entire decision history", icon: "search" } },
  { id: "workspace", type: "processNode", position: { x: CX - NODE_W / 2, y: ROW * 4 }, data: { label: "Workspace Intelligence", description: "Context-aware insights that improve as you add more decisions", icon: "folderKanban" } },
  { id: "agent", type: "processNode", position: { x: CX - NODE_W / 2, y: ROW * 5 }, data: { label: "Future Agent Layer", description: "Autonomous agents that proactively surface relevant decisions", icon: "zap" } },
]

const initialEdges = [
  { id: "imp-ext", source: "import", target: "extraction", type: "smoothstep" as const, animated: true, style: { stroke: "hsl(var(--color-primary))", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed as const, color: "hsl(var(--color-primary))", width: 14, height: 14 } },
  { id: "ext-mem", source: "extraction", target: "memory", type: "smoothstep" as const, animated: true, style: { stroke: "hsl(var(--color-primary))", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed as const, color: "hsl(var(--color-primary))", width: 14, height: 14 } },
  { id: "mem-kn", source: "memory", target: "knowledge", type: "smoothstep" as const, animated: true, style: { stroke: "hsl(var(--color-primary))", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed as const, color: "hsl(var(--color-primary))", width: 14, height: 14 } },
  { id: "mem-se", source: "memory", target: "search", type: "smoothstep" as const, animated: true, style: { stroke: "hsl(var(--color-primary))", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed as const, color: "hsl(var(--color-primary))", width: 14, height: 14 } },
  { id: "kn-ws", source: "knowledge", target: "workspace", type: "smoothstep" as const, animated: true, style: { stroke: "hsl(var(--color-primary))", strokeWidth: 1.5, opacity: 0.6 }, markerEnd: { type: MarkerType.ArrowClosed as const, color: "hsl(var(--color-primary))", width: 14, height: 14 } },
  { id: "se-ws", source: "search", target: "workspace", type: "smoothstep" as const, animated: true, style: { stroke: "hsl(var(--color-primary))", strokeWidth: 1.5, opacity: 0.6 }, markerEnd: { type: MarkerType.ArrowClosed as const, color: "hsl(var(--color-primary))", width: 14, height: 14 } },
  { id: "ws-ag", source: "workspace", target: "agent", type: "smoothstep" as const, animated: true, style: { stroke: "hsl(var(--color-primary))", strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed as const, color: "hsl(var(--color-primary))", width: 14, height: 14 } },
]

function ProcessNode({ data }: { data: { label: string; description: string; icon?: string } }) {
  const [hovered, setHovered] = React.useState(false)
  const iconName = data.icon as keyof typeof Icons | undefined
  const Icon = iconName ? Icons[iconName] : null
  return (
    <div className="group relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-2 !h-2 !border-2 !border-card" />
      <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 cursor-pointer" style={{ width: NODE_W }}>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            {Icon && <Icon className="h-4 w-4 text-primary" />}
          </div>
          <span className="text-sm font-medium text-foreground">{data.label}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-2 !h-2 !border-2 !border-card" />
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-xl pointer-events-none z-50">
            {data.description}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const nodeTypes = { processNode: ProcessNode as any }

function FlowControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const btns = [
    { label: "+", action: () => zoomIn(), title: "Zoom in" },
    { label: "−", action: () => zoomOut(), title: "Zoom out" },
    { label: "Fit", action: () => fitView({ padding: 0.2 }), title: "Fit view" },
  ]
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
      {btns.map((b) => (
        <button key={b.label} onClick={b.action} title={b.title} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-xs font-medium text-foreground shadow-sm transition-all hover:bg-accent hover:shadow-md cursor-pointer">
          {b.label}
        </button>
      ))}
    </div>
  )
}

export function ArchitectureSection() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)
  const [resetKey, setResetKey] = React.useState(0)

  React.useEffect(() => {
    const handleResize = () => setResetKey((k) => k + 1)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <section id="how-it-works" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How RelayOS{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From raw conversations to structured knowledge — a visual pipeline.
            </p>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <div className="mt-16 rounded-2xl border border-border bg-card p-4 sm:p-8 relative shadow-sm">
            <div style={{ height: 600 }} className="w-full [&_.react-flow]:!bg-transparent [&_.react-flow__pane]:!bg-transparent">
              <ReactFlow
                key={resetKey}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.3}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
                className="rounded-xl"
                nodesDraggable={false}
                nodesConnectable={false}
                panOnDrag
                zoomOnScroll
              >
                <Background color="hsl(var(--color-border))" gap={24} size={1} />
                <FlowControls />
              </ReactFlow>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}