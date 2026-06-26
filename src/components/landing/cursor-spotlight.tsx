"use client"

import * as React from "react"

export function CursorSpotlight() {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      }
    }
    window.addEventListener("mousemove", handleMouse)
    return () => window.removeEventListener("mousemove", handleMouse)
  }, [])

  return (
    <div
      ref={ref}
      className="spotlight"
      style={{ willChange: "transform" }}
    />
  )
}