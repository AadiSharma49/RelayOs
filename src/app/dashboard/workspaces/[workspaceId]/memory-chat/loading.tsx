import { RelayLoader } from "@/components/loading/relay-loader"
import { MemoryChatSkeleton } from "@/components/loading/page-skeletons"

export default function MemoryChatLoading() {
  return (
    <>
      <RelayLoader
        title="Memory Chat"
        subtitle="Loading your chat history"
        messages={[
          "Preparing chat...",
          "Loading conversations...",
          "Indexing memories...",
          "Syncing AI...",
          "Almost ready...",
        ]}
      />
      <div className="hidden">
        <MemoryChatSkeleton />
      </div>
    </>
  )
}