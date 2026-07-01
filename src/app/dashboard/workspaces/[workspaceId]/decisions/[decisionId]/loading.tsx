import { RelayLoader } from "@/components/loading/relay-loader"
import { DecisionSkeleton } from "@/components/loading/page-skeletons"

export default function DecisionDetailLoading() {
  return (
    <>
      <RelayLoader
        title="Decision"
        subtitle="Loading decision details"
        messages={[
          "Preparing decision...",
          "Loading details...",
          "Fetching metadata...",
          "Almost ready...",
        ]}
      />
      <div className="hidden">
        <DecisionSkeleton />
      </div>
    </>
  )
}