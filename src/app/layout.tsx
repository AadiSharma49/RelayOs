import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
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

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
}

// Set NEXT_PUBLIC_SITE_URL to your deployed URL in production so canonical URLs,
// Open Graph tags and the sitemap all resolve to absolute links.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://relayos.app"

const TITLE = "RelayOS — Give Your AI a Memory"
const DESCRIPTION =
  "RelayOS captures your ChatGPT, Claude and Gemini conversations and automatically extracts the decisions, action items and open questions inside them — then makes them searchable by meaning. Your AI's memory layer."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: TITLE,
    template: "%s | RelayOS",
  },
  description: DESCRIPTION,
  applicationName: "RelayOS",
  keywords: [
    "AI conversation memory",
    "decision intelligence",
    "ChatGPT memory",
    "Claude memory",
    "AI decision tracking",
    "capture AI conversations",
    "team decision log",
    "semantic search",
    "MCP server",
    "second brain for AI",
    "RelayOS",
  ],
  authors: [{ name: "RelayOS" }],
  creator: "RelayOS",
  publisher: "RelayOS",
  category: "productivity",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "RelayOS",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@relayos",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RelayOS",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, Chrome Extension",
  description: DESCRIPTION,
  url: siteUrl,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
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
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          <SmoothScrollProvider>
            <AuthProvider>{children}</AuthProvider>
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}