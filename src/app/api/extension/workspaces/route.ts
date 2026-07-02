import { prisma } from "@/lib/prisma"
import { getUserFromApiKey, corsPreflight, jsonWithCors } from "@/lib/api-auth"

/**
 * GET /api/extension/workspaces
 * Lists the authenticated user's workspaces for the browser extension's
 * workspace picker. Authenticated with a Bearer API key (not a Clerk session).
 */

export async function OPTIONS() {
  return corsPreflight()
}

export async function GET(request: Request) {
  const user = await getUserFromApiKey(request)
  if (!user) {
    return jsonWithCors({ error: "Invalid or missing API key" }, { status: 401 })
  }

  const workspaces = await prisma.workspace.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
  })

  return jsonWithCors({ workspaces })
}
