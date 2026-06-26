"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"
import { DashboardHeader } from "./header"

interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  return (
    <div className="min-h-screen">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-overlay md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          isCollapsed={false}
          onToggle={() => setIsMobileOpen(false)}
        />
      </div>

      <div
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        <DashboardHeader
          onMenuClick={() => setIsMobileOpen(true)}
        />
        <main className={cn("p-4 sm:p-6 lg:p-8", className)}>
          {children}
        </main>
      </div>
    </div>
  )
}