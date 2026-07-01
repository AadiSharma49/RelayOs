import { RelayLoader } from "@/components/loading/relay-loader"
import { SettingsSkeleton } from "@/components/loading/page-skeletons"

export default function SettingsLoading() {
  return (
    <>
      <RelayLoader
        title="Settings"
        subtitle="Loading your settings"
        messages={[
          "Preparing settings...",
          "Loading profile...",
          "Fetching preferences...",
          "Almost ready...",
        ]}
      />
      <div className="hidden">
        <SettingsSkeleton />
      </div>
    </>
  )
}