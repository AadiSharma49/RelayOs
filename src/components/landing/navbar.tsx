"use client"

import * as React from "react"
import Link from "next/link"
import { useUser, useClerk } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Icons } from "@/lib/icons"
import { APP_NAME, NAV_LINKS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const { isSignedIn, user } = useUser()
  const clerk = useClerk()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [hovered, setHovered] = React.useState<string | null>(null)

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const logHref = isSignedIn ? "/dashboard" : "/"

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        className={cn(
          "glass-panel mx-auto flex h-14 w-full max-w-5xl items-center justify-between rounded-full px-4 shadow-lg shadow-black/5 transition-all duration-500 sm:px-6",
          isScrolled && "shadow-xl shadow-black/10"
        )}
      >
        {/* Logo */}
        <Link href={logHref} className="group flex shrink-0 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 shadow-md shadow-primary/30 transition-transform duration-300 group-hover:scale-110">
            <span className="text-xs font-bold text-white">R</span>
          </div>
          <span className="font-heading hidden text-sm font-semibold tracking-tight sm:inline">
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop Navigation with animated hover pill */}
        <div
          className="hidden items-center gap-1 md:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHovered(link.href)}
              className="relative rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {hovered === link.href && (
                <motion.span
                  layoutId="nav-hover"
                  className="absolute inset-0 -z-10 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="hidden sm:inline">
                <Button
                  size="sm"
                  className="h-8 rounded-full bg-gradient-to-r from-primary to-violet-500 px-4 text-xs font-semibold text-white shadow-md shadow-primary/25 transition-all hover:shadow-lg hover:shadow-primary/40"
                >
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 ring-2 ring-border/60 transition-all hover:ring-primary/40">
                      <AvatarImage src={user?.imageUrl} alt={user?.fullName || "Avatar"} />
                      <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.fullName || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress || ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <Icons.dashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/workspaces">
                      <Icons.folderKanban className="mr-2 h-4 w-4" />
                      Workspaces
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      clerk.signOut().then(() => {
                        window.location.href = "/"
                      })
                    }}
                  >
                    <Icons.logOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" className="hidden sm:inline">
                <Button
                  size="sm"
                  className="h-8 rounded-full bg-gradient-to-r from-primary to-violet-500 px-4 text-xs font-semibold text-white shadow-md shadow-primary/25 transition-all hover:shadow-lg hover:shadow-primary/40"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="h-8 w-8 rounded-full md:hidden"
          >
            {isMobileMenuOpen ? <Icons.x className="h-4 w-4" /> : <Icons.menu className="h-4 w-4" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="glass-panel absolute left-4 right-4 top-16 rounded-2xl shadow-xl md:hidden"
          >
            <div className="space-y-1 px-4 pb-4 pt-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-2">
                {isSignedIn ? (
                  <Link href="/dashboard" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="h-9 w-full rounded-full bg-gradient-to-r from-primary to-violet-500 text-xs font-semibold text-white">
                      <Icons.dashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-in" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="h-9 w-full rounded-full text-xs">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="h-9 w-full rounded-full bg-gradient-to-r from-primary to-violet-500 text-xs font-semibold text-white">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
