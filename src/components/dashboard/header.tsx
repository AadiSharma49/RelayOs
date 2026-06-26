"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Icons } from "@/lib/icons"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { GlobalSearchDialog } from "@/components/dashboard/global-search-dialog"

interface DashboardHeaderProps {
  onMenuClick: () => void
  className?: string
}

export function DashboardHeader({
  onMenuClick,
  className,
}: DashboardHeaderProps) {
  const { user } = useUser()
  const clerk = useClerk()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-xl px-4 sm:px-6",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="rounded-full md:hidden"
      >
        <Icons.menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <Button
        variant="outline"
        className={cn(
          "hidden md:flex items-center gap-2 h-9 rounded-lg text-sm text-muted-foreground",
          "border-border/60 hover:bg-muted/50 hover:text-foreground"
        )}
        onClick={() => setSearchOpen(true)}
      >
        <Icons.search className="h-4 w-4" />
        Search...
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground ml-auto">
          ⌘K
        </kbd>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full md:hidden"
        onClick={() => setSearchOpen(true)}
      >
        <Icons.search className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user?.imageUrl}
                  alt={user?.fullName || "Avatar"}
                />
                <AvatarFallback>
                  {user?.firstName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.fullName || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress || ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Icons.user className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icons.settings className="mr-2 h-4 w-4" />
              Settings
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
      </div>

      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}