import { RelayLoader } from "@/components/loading/relay-loader"
import { ImportSkeleton } from "@/components/loading/page-skeletons"

export default function ImportLoading() {
  return (
    <>
      <RelayLoader
        title="Import"
        subtitle="Preparing import"
        messages={[
          "Preparing import...",
          "Validating data...",
          "Processing conversations...",
          "Almost ready...",
        ]}
      />
      <div className="hidden">
        <ImportSkeleton />
      </div>
    </>
  )
}