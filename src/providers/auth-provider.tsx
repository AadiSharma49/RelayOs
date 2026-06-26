"use client"

import { ClerkProvider } from "@clerk/nextjs"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary:
            "bg-primary text-primary-foreground hover:bg-primary/90",
          card: "rounded-xl shadow-lg",
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
