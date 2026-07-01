import { RelayLoader } from "@/components/loading/relay-loader"
import { DashboardPageSkeleton } from "@/components/loading/page-skeletons"

export default function DashboardLoading() {
  return (
    <>
      <RelayLoader
        title="Dashboard"
        subtitle="Loading your overview"
        messages={[
          "Preparing your dashboard...",
          "Loading statistics...",
          "Gathering insights...",
          "Almost ready...",
        ]}
      />
      <div className="hidden">
        <DashboardPageSkeleton />
      </div>
    </>
  )
}