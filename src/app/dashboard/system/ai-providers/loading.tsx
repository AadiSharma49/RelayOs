import { RelayLoader } from "@/components/loading/relay-loader"
import { SystemSkeleton } from "@/components/loading/page-skeletons"

export default function AIProvidersLoading() {
  return (
    <>
      <RelayLoader
        title="AI Providers"
        subtitle="Loading AI configurations"
        messages={[
          "Preparing AI providers...",
          "Checking connections...",
          "Loading models...",
          "Almost ready...",
        ]}
      />
      <div className="hidden">
        <SystemSkeleton />
      </div>
    </>
  )
}