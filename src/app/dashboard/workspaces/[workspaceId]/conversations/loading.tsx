import { RelayLoader } from "@/components/loading/relay-loader"
import { ConversationSkeleton } from "@/components/loading/page-skeletons"

export default function ConversationsLoading() {
  return (
    <>
      <RelayLoader
        title="Conversations"
        subtitle="Loading conversations"
        messages={[
          "Preparing conversations...",
          "Loading messages...",
          "Building timeline...",
          "Almost ready...",
        ]}
      />
      <div className="hidden">
        <ConversationSkeleton />
      </div>
    </>
  )
}