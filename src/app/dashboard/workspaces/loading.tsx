import { RelayLoader } from "@/components/loading/relay-loader"
import { WorkspaceListSkeleton } from "@/components/loading/page-skeletons"

export default function WorkspacesLoading() {
  return (
    <>
      <RelayLoader
        title="Workspaces"
        subtitle="Loading your workspaces"
        messages={[
          "Preparing workspaces...",
          "Loading projects...",
          "Organizing data...",
          "Almost ready...",
        ]}
      />
      <div className="hidden">
        <WorkspaceListSkeleton />
      </div>
    </>
  )
}