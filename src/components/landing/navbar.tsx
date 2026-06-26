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
          "mx-auto flex h-14 w-full max-w-5xl items-center justify-between rounded-full border border-border/50 bg-background/70 backdrop-blur-2xl shadow-lg shadow-black/5 transition-all duration-500 px-4 sm:px-6",
          isScrolled && "shadow-xl shadow-black/10 border-border"
        )}
      >
        {/* Logo */}
        <Link href={logHref} className="flex items-center gap-2 group shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/25">
            <span className="text-xs font-bold text-primary-foreground">R</span>
          </div>
          <span className="text-sm font-semibold tracking-tight hidden sm:inline">{APP_NAME}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="hidden sm:inline">
                <Button size="sm" className="h-8 rounded-full px-4 text-xs">
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.imageUrl} alt={user?.fullName || "Avatar"} />
                      <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.fullName || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.primaryEmailAddress?.emailAddress || ""}</p>
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
                <Button variant="ghost" size="sm" className="rounded-full h-8 text-xs px-3">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="rounded-full h-8 text-xs px-4">
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
            className="rounded-full h-8 w-8 md:hidden"
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
            className="absolute top-16 left-4 right-4 rounded-2xl border border-border/50 bg-background/90 backdrop-blur-2xl shadow-xl md:hidden"
          >
            <div className="space-y-1 px-4 pb-4 pt-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-2">
                {isSignedIn ? (
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full rounded-full text-xs h-9">
                      <Icons.dashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-in" className="flex-1">
                      <Button variant="outline" className="w-full rounded-full text-xs h-9">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/sign-up" className="flex-1">
                      <Button className="w-full rounded-full text-xs h-9">Get Started</Button>
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