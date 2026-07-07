export const APP_NAME = "RelayOS"
export const APP_TAGLINE = "Capture decisions from AI conversations"
export const APP_DESCRIPTION =
  "RelayOS extracts decisions, action items, and questions from your AI chats and makes them searchable."

export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "/extension", label: "Extension" },
  { href: "#faq", label: "FAQ" },
] as const

export const FEATURES = [
  {
    title: "Import Conversations",
    description:
      "Paste text from ChatGPT, Claude, Gemini, Cursor, or any AI tool.",
    icon: "MessageSquare",
  },
  {
    title: "AI Extraction",
    description:
      "Automatically extract decisions, action items, and questions.",
    icon: "GitBranch",
  },
  {
    title: "Review & Approve",
    description:
      "Check extracted items before saving. Keep only what matters.",
    icon: "CheckCircle",
  },
  {
    title: "Global Search",
    description:
      "Keyword search across conversations, decisions, action items, and questions.",
    icon: "Search",
  },
  {
    title: "Workspaces",
    description:
      "Organize conversations by project or team.",
    icon: "FolderKanban",
  },
  {
    title: "Dashboard",
    description:
      "Stats and recent activity in one place.",
    icon: "BarChart3",
  },
] as const

export const USE_CASES = [
  {
    title: "Product Teams",
    description: "Track feature decisions and design rationale.",
    icon: "Lightbulb",
  },
  {
    title: "Engineering",
    description: "Capture architecture decisions and code review context.",
    icon: "Zap",
  },
  {
    title: "Leadership",
    description: "Maintain strategic context across meetings.",
    icon: "Users",
  },
  {
    title: "Research",
    description: "Organize findings from AI assistants.",
    icon: "Search",
  },
] as const

export const SIDEBAR_NAV = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Workspaces",
    href: "/dashboard/workspaces",
    icon: "FolderKanban",
  },
  {
    title: "Search",
    href: "/dashboard/search",
    icon: "Search",
  },
  {
    title: "Conflicts",
    href: "/dashboard/conflicts",
    icon: "AlertCircle",
  },
  {
    title: "Import",
    href: "/dashboard/import",
    icon: "Download",
  },
] as const
