"use client"

import { motion, AnimatePresence } from "framer-motion"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {/* Sunrise glow effect - only visible in light mode */}
        <div className="sunrise-glow" aria-hidden="true" />
        <div className="sunrise-horizon" aria-hidden="true" />
        <DashboardShell>{children}</DashboardShell>
      </motion.div>
    </AnimatePresence>
  )
}
