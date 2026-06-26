import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your settings",
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold">Profile</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile information.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your notification preferences.
        </p>
      </div>
    </div>
  )
}