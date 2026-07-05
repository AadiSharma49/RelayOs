import Link from "next/link"

export const metadata = {
  title: "Privacy Policy — RelayOS",
  description: "How RelayOS and the RelayOS browser extension collect, use and store your data.",
}

const LAST_UPDATED = "July 5, 2026"

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to RelayOS
      </Link>

      <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="prose-relay mt-10 space-y-8 text-[15px] leading-relaxed text-muted-foreground">
        <section>
          <p>
            RelayOS is a decision-intelligence tool that captures your AI conversations and
            extracts the decisions, action items and questions inside them so you can search and
            revisit them later. This policy explains what the RelayOS web app and the RelayOS
            browser extension collect, why, and how it is handled.
          </p>
        </section>

        <Section title="What we collect">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Account information</strong> — your name, email
              and avatar, provided through our authentication provider when you sign in.
            </li>
            <li>
              <strong className="text-foreground">Content you capture</strong> — the text of AI
              conversations you explicitly choose to send to RelayOS (via the extension, import, or
              paste), and the decisions, action items and questions extracted from them.
            </li>
            <li>
              <strong className="text-foreground">Workspace data</strong> — the workspaces, notes
              and items you create in the app.
            </li>
          </ul>
        </Section>

        <Section title="What the browser extension does">
          <p>
            The extension only reads a conversation from the page you are on{" "}
            <strong className="text-foreground">when you click &ldquo;Capture&rdquo;</strong>. It
            does not run in the background, does not track your browsing, and does not read any page
            you have not explicitly asked it to capture. Captured text is sent directly to the
            RelayOS server URL you configure, authenticated with your personal API key.
          </p>
        </Section>

        <Section title="How we use your data">
          <ul className="list-disc space-y-2 pl-5">
            <li>To provide the core service: storing, extracting from, and searching your captures.</li>
            <li>
              To generate AI extractions and semantic-search embeddings, captured text is sent to
              our AI provider (Google&rsquo;s Gemini API) for processing.
            </li>
            <li>We do not sell your data, and we do not use it for advertising.</li>
          </ul>
        </Section>

        <Section title="Where your data is stored">
          <p>
            Your data is stored in a PostgreSQL database associated with your RelayOS instance.
            API keys are stored only as one-way hashes — the plaintext key is shown to you once at
            generation time and cannot be recovered by us.
          </p>
        </Section>

        <Section title="Your controls">
          <ul className="list-disc space-y-2 pl-5">
            <li>You choose what to capture — nothing is sent without your explicit action.</li>
            <li>You can delete workspaces, conversations and extracted items at any time.</li>
            <li>You can regenerate or revoke your API key from Settings, disconnecting the extension.</li>
          </ul>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy or your data? Reach out to the RelayOS team through the
            support channel listed on your instance. We&rsquo;ll update this page and the date above
            when the policy changes.
          </p>
        </Section>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  )
}
