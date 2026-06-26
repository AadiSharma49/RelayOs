export const APP_NAME = "RelayOS"
export const APP_TAGLINE = "The Memory Layer for Human and AI Decisions"
export const APP_DESCRIPTION =
  "RelayOS captures, organizes, and explains important decisions across projects so you never lose context."

export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#use-cases", label: "Use Cases" },
] as const

export const FEATURES = [
  {
    title: "Conversation Import",
    description:
      "Import conversations from ChatGPT, Claude, Gemini, Cursor, Slack, Discord, or any text source.",
    icon: "MessageSquare",
  },
  {
    title: "Decision Extraction",
    description:
      "Automatically extract key decisions, action items, and rationale from conversations.",
    icon: "GitBranch",
  },
  {
    title: "Knowledge Graph",
    description:
      "See how decisions connect across projects with an interactive knowledge graph.",
    icon: "GitBranch",
  },
  {
    title: "Workspace Intelligence",
    description:
      "Every workspace gets smarter as you add more conversations and decisions.",
    icon: "Brain",
  },
  {
    title: "Decision Search",
    description:
      "Search across every decision ever made with natural language queries.",
    icon: "Search",
  },
  {
    title: "Enterprise Security",
    description:
      "Bank-grade security with end-to-end encryption and role-based access control.",
    icon: "Shield",
  },
] as const

export const HERO_NODES = [
  { name: "ChatGPT", label: "ChatGPT", color: "#10a37f", x: 15, y: 18, delay: 0 },
  { name: "Claude", label: "Claude", color: "#d4a574", x: 75, y: 15, delay: 0.3 },
  { name: "Gemini", label: "Gemini", color: "#4285f4", x: 85, y: 55, delay: 0.6 },
  { name: "Cursor", label: "Cursor", color: "#a855f7", x: 10, y: 62, delay: 0.9 },
  { name: "Discord", label: "Discord", color: "#5865f2", x: 25, y: 82, delay: 1.2 },
  { name: "Notion", label: "Notion", color: "#ffffff", x: 75, y: 82, delay: 1.5 },
] as const

export const PRODUCT_SECTIONS = [
  {
    id: "capture",
    title: "Capture Conversations",
    subtitle: "Import from anywhere, keep everything.",
    description:
      "RelayOS connects to your entire AI ecosystem. Import conversations from ChatGPT, Claude, Gemini, Cursor, Slack, Discord, Notion, or paste any text. Every conversation becomes a searchable, structured memory.",
    icon: "MessageSquare",
    features: ["Multi-source import", "Auto-parsing", "Batch upload", "Real-time sync"],
  },
  {
    id: "extraction",
    title: "Decision Extraction",
    subtitle: "AI finds what matters.",
    description:
      "Our extraction engine identifies key decisions, action items, and rationale from any conversation. No more scrolling through long threads. The important decisions surface automatically.",
    icon: "GitBranch",
    features: ["Decision detection", "Action item extraction", "Rationale capture", "Priority scoring"],
  },
  {
    id: "memory",
    title: "Decision Memory",
    subtitle: "Never lose context again.",
    description:
      "Every decision is stored with full context — who made it, why, when, and what it meant for your project. Search your entire decision history in seconds.",
    icon: "Brain",
    features: ["Persistent storage", "Context preservation", "Timeline tracking", "Decision chains"],
  },
  {
    id: "knowledge",
    title: "Knowledge Graph",
    subtitle: "See how decisions connect.",
    description:
      "RelayOS builds a knowledge graph that maps the relationships between your decisions. Find connections you never knew existed. Understand the full picture of your project.",
    icon: "BarChart3",
    features: ["Relationship mapping", "Dependency tracking", "Pattern recognition", "Visual exploration"],
  },
  {
    id: "workspace",
    title: "Workspace Intelligence",
    subtitle: "Each workspace gets smarter.",
    description:
      "Every workspace in RelayOS learns from your decisions. As you add more conversations, the workspace develops intelligence — surfacing relevant decisions, spotting patterns, and providing context.",
    icon: "FolderKanban",
    features: ["Contextual suggestions", "Pattern detection", "Smart summaries", "Decision scoring"],
  },
  {
    id: "search",
    title: "Decision Search",
    subtitle: "Find any decision, instantly.",
    description:
      "Search across every decision ever made in your organization using natural language. Ask questions like 'What did we decide about the API?' and get the answer with full context.",
    icon: "Search",
    features: ["Natural language queries", "Semantic search", "Full-text search", "Cross-workspace search"],
  },
  {
    id: "dev-use-cases",
    title: "Developer Use Cases",
    subtitle: "Built for technical teams.",
    description:
      "Track architecture decisions, capture code review rationale, and maintain technical debt context. RelayOS helps engineering teams remember why they built things the way they did.",
    icon: "Zap",
    features: ["Architecture decisions", "Code review context", "Tech debt tracking", "Sprint retrospectives"],
  },
  {
    id: "team-use-cases",
    title: "Team Use Cases",
    subtitle: "For every team that makes decisions.",
    description:
      "Product teams track feature rationale. Leadership maintains strategic context. Research teams organize hypotheses and conclusions. Every team benefits from a decision memory layer.",
    icon: "Users",
    features: ["Product roadmap context", "Strategic alignment", "Research continuity", "Onboarding acceleration"],
  },
  {
    id: "future-vision",
    title: "Future Vision",
    subtitle: "Autonomous decision intelligence.",
    description:
      "RelayOS is building toward an agent layer that can proactively surface relevant decisions, suggest context before meetings, and automate routine decision documentation.",
    icon: "Brain",
    features: ["Proactive suggestions", "Meeting prep automation", "Decision prediction", "Agent orchestration"],
  },
] as const

export const USE_CASES = [
  {
    title: "Product Teams",
    description: "Track feature decisions, design rationale, and sprint outcomes.",
    icon: "Lightbulb",
  },
  {
    title: "Engineering",
    description: "Capture architecture decisions, code reviews, and technical debt.",
    icon: "Zap",
  },
  {
    title: "Leadership",
    description: "Maintain strategic context across meetings, calls, and discussions.",
    icon: "Users",
  },
  {
    title: "Research",
    description: "Organize findings, hypotheses, and conclusions from AI assistants.",
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
    title: "AI Providers",
    href: "/dashboard/system/ai-providers",
    icon: "Settings",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
  },
] as const
