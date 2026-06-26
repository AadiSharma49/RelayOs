import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Sunrise glow effect - only visible in light mode */}
      <div className="sunrise-glow" aria-hidden="true" />
      <div className="sunrise-horizon" aria-hidden="true" />
      <DashboardShell>{children}</DashboardShell>
    </>
  )
}