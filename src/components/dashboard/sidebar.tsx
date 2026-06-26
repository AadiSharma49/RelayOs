"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/mode-toggle"
import { Icons } from "@/lib/icons"
import { APP_NAME, SIDEBAR_NAV } from "@/lib/constants"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard: Icons.dashboard,
  FolderKanban: Icons.folderKanban,
  Lightbulb: Icons.lightbulb,
  Settings: Icons.settings,
}

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">
                R
              </span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              {APP_NAME}
            </span>
          </Link>
        )}
        {isCollapsed && (
          <Link
            href="/dashboard"
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary"
          >
            <span className="text-sm font-bold text-primary-foreground">R</span>
          </Link>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <TooltipProvider delayDuration={0}>
          {SIDEBAR_NAV.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(item.href))

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          !isCollapsed && "mr-3"
                        )}
                      />
                    )}
                    {!isCollapsed && <span>{item.title}</span>}
                    {isActive && !isCollapsed && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                      />
                    )}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="ml-2">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </nav>

      <Separator />

      {/* Bottom Actions */}
      <div className="p-3">
        <div
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="rounded-full"
          >
            {isCollapsed ? (
              <Icons.chevronRight className="h-4 w-4" />
            ) : (
              <Icons.chevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  )
}