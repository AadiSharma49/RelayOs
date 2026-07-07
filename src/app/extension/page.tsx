import Link from "next/link"
import { Navbar, Footer } from "@/components/landing"
import { Icons } from "@/lib/icons"

export const metadata = {
  title: "Browser Extension — One-click AI conversation capture",
  description:
    "Install the RelayOS browser extension to capture your ChatGPT, Claude and Gemini conversations with one click — RelayOS auto-extracts the decisions, action items and questions.",
  alternates: { canonical: "/extension" },
}

const WHAT_IT_DOES = [
  {
    icon: Icons.messageSquare,
    title: "One-click capture",
    body: "Open any AI chat, click the RelayOS icon — the whole conversation is saved. No copy-paste.",
  },
  {
    icon: Icons.gitBranch,
    title: "Auto-extraction",
    body: "RelayOS pulls out the decisions, action items and open questions the moment you capture.",
  },
  {
    icon: Icons.folderKanban,
    title: "Straight to a workspace",
    body: "Pick which workspace to file it under, right from the popup. It's searchable instantly.",
  },
]

const INSTALL_STEPS = [
  {
    title: "Download & unzip",
    body: "Download the extension below and unzip it somewhere permanent (don't delete the folder afterwards).",
  },
  {
    title: "Open Chrome extensions",
    body: "Go to chrome://extensions and turn on “Developer mode” (top-right toggle).",
  },
  {
    title: "Load unpacked",
    body: "Click “Load unpacked” and select the unzipped folder. Pin the RelayOS icon to your toolbar.",
  },
  {
    title: "Connect your account",
    body: "Click the icon, enter your RelayOS URL and your API key from Settings → API Key. You're done.",
  },
]

export default function ExtensionPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pt-32 pb-24 sm:px-6">
        {/* Hero */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Icons.plug className="h-3.5 w-3.5 text-primary" />
            Browser Extension
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Capture AI chats with <span className="text-primary">one click</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Works on Claude, ChatGPT and Gemini. Click the icon on any conversation and RelayOS
            saves it and extracts the decisions inside — no copy-paste.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <a
              href="/relayos-extension.zip"
              download
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-primary to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-opacity hover:opacity-90"
            >
              <Icons.download className="h-4 w-4" />
              Download extension (.zip)
            </a>
            <p className="text-xs text-muted-foreground">
              Chrome, Edge & Brave · Chrome Web Store version coming soon
            </p>
          </div>
        </div>

        {/* What it does */}
        <div className="mt-20 grid gap-4 sm:grid-cols-3">
          {WHAT_IT_DOES.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>

        {/* Install steps */}
        <div className="mt-20">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Install in 4 steps</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Takes about a minute. No build tools needed.
          </p>

          <ol className="mt-8 space-y-6">
            {INSTALL_STEPS.map((step, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary">
                  {i + 1}
                </div>
                <div className="pt-1">
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-col gap-3 rounded-xl border bg-card/50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Need your API key? It&apos;s in your dashboard settings.
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Open Settings
              <Icons.arrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
