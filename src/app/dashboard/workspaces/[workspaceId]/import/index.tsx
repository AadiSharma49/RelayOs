"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"

export function ImportConversationButton({
  workspaceId,
}: {
  workspaceId: string
}) {
  const router = useRouter()

  return (
    <Button
      onClick={() =>
        router.push(`/dashboard/workspaces/${workspaceId}/import`)
      }
    >
      <Icons.plus className="mr-2 h-4 w-4" />
      Import Conversation
    </Button>
  )
}