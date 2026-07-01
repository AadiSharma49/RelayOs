import { RelayLoader } from "@/components/loading/relay-loader"

export default function RootLoading() {
  return (
    <RelayLoader
      title="RelayOS"
      subtitle="Loading your decision intelligence platform"
      messages={[
        "Preparing your workspace...",
        "Loading conversations...",
        "Building memory graph...",
        "Finding decisions...",
        "Syncing AI...",
        "Connecting knowledge...",
        "Almost ready...",
        "Welcome back.",
      ]}
    />
  )
}