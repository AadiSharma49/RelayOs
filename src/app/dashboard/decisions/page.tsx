import { redirect } from "next/navigation"

export default function DecisionsRedirect() {
  redirect("/dashboard/workspaces")
}