"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/lib/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditWorkspaceDialog, DeleteWorkspaceDialog } from "../components"

export function WorkspaceActions({
  workspaceId,
  workspaceName,
}: {
  workspaceId: string
  workspaceName: string
}) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Icons.moreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Icons.edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive"
          >
            <Icons.trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditWorkspaceDialog
        workspaceId={workspaceId}
        currentName={workspaceName}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteWorkspaceDialog
        workspaceId={workspaceId}
        workspaceName={workspaceName}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}