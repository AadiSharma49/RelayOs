import { RelayLoader } from "@/components/loading/relay-loader"
import { WorkspaceDetailSkeleton } from "@/components/loading/page-skeletons"

export default function WorkspaceDetailLoading() {
  return (
    <>
      <RelayLoader
        title="Workspace"
        subtitle="Loading workspace data"
        messages={[
          "Preparing workspace...",
          "Loading conversations...",
          "Fetching decisions...",
          "Loading action items...",
          "Almost ready...",
        ]}
      />
      <div className="hidden">
        <WorkspaceDetailSkeleton />
      </div>
    </>
  )
}