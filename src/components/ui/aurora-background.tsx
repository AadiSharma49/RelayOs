"use client"

import * as React from "react"

interface AuroraBackgroundProps {
  className?: string
  /** Opacity of the whole effect (0–1). Default 0.6. */
  intensity?: number
}

/**
 * Lightweight animated "aurora" background — flowing gradient blobs drawn on a
 * Canvas 2D layer and softened with a CSS blur (GPU-composited, cheap). No WebGL,
 * no dependencies. Pauses on `prefers-reduced-motion` and when the tab is hidden,
 * and caps devicePixelRatio so it stays fast on mobile/hi-dpi screens.
 */
export function AuroraBackground({ className, intensity = 0.6 }: AuroraBackgroundProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext("2d")
    if (!ctx) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    const blobs = [
      { x: 0.28, y: 0.22, r: 0.5, color: [96, 165, 250], sx: 0.00012, sy: 0.00009, ph: 0 },
      { x: 0.72, y: 0.3, r: 0.46, color: [167, 139, 250], sx: -0.0001, sy: 0.00013, ph: 2.1 },
      { x: 0.5, y: 0.68, r: 0.56, color: [56, 189, 248], sx: 0.00008, sy: -0.00011, ph: 4.2 },
    ]

    let w = 0
    let h = 0
    const resize = () => {
      w = cv.clientWidth
      h = cv.clientHeight
      cv.width = Math.max(1, Math.floor(w * dpr))
      cv.height = Math.max(1, Math.floor(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    let raf = 0
    let t = 0
    let running = true

    const draw = () => {
      t += 1
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = "lighter"
      for (const b of blobs) {
        const cx = (b.x + Math.sin(t * b.sx * 1000 + b.ph) * 0.12) * w
        const cy = (b.y + Math.cos(t * b.sy * 1000 + b.ph) * 0.12) * h
        const rad = b.r * Math.max(w, h)
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
        grad.addColorStop(0, `rgba(${b.color[0]},${b.color[1]},${b.color[2]},0.5)`)
        grad.addColorStop(1, `rgba(${b.color[0]},${b.color[1]},${b.color[2]},0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, rad, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = () => {
      if (!running) return
      draw()
      raf = requestAnimationFrame(loop)
    }

    if (reduceMotion) {
      draw() // one static frame
    } else {
      loop()
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!reduceMotion) {
        running = true
        loop()
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        width: "100%",
        height: "100%",
        filter: "blur(70px)",
        opacity: intensity,
      }}
    />
  )
}

export default AuroraBackground
