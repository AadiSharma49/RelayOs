import { RelayLoader } from "@/components/loading/relay-loader"
import { DecisionSkeleton } from "@/components/loading/page-skeletons"

export default function DecisionsListLoading() {
  return (
    <>
      <RelayLoader
        title="Decisions"
        subtitle="Loading all decisions"
        messages={[
          "Preparing decisions...",
          "Loading decision history...",
          "Analyzing patterns...",
          "Almost ready...",
        ]}
      />
      <div className="hidden">
        <DecisionSkeleton />
      </div>
    </>
  )
}