import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/providers/theme-provider"
import { AuthProvider } from "@/providers/auth-provider"
import { SmoothScrollProvider } from "@/providers/smooth-scroll-provider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: "RelayOS - AI Decision Intelligence Platform",
    template: "%s | RelayOS",
  },
  description:
    "Make smarter decisions with AI-powered insights. RelayOS helps you analyze, decide, and act with confidence.",
  keywords: [
    "AI",
    "decision intelligence",
    "analytics",
    "business intelligence",
    "RelayOS",
  ],
  authors: [{ name: "RelayOS" }],
  creator: "RelayOS",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "RelayOS",
    title: "RelayOS - AI Decision Intelligence Platform",
    description:
      "Make smarter decisions with AI-powered insights. RelayOS helps you analyze, decide, and act with confidence.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <SmoothScrollProvider>
            <AuthProvider>{children}</AuthProvider>
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}