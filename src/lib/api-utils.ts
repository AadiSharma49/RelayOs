import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

/**
 * Finds or creates a PostgreSQL User record matching the Clerk session.
 *
 * After Clerk login succeeds, the `auth()` call returns `userId` (the Clerk
 * user ID). But no PostgreSQL User record exists yet — it must be created.
 *
 * This function:
 * 1. Gets the Clerk user ID from the session
 * 2. Looks up an existing PostgreSQL User by clerkId
 * 3. If not found, fetches the full Clerk user via the Backend API
 *    (this gives us email, name, avatar — not available from session claims)
 * 4. Creates the PostgreSQL User record
 * 5. Logs whether it was created or already existed
 */
export async function getOrCreateUser(): Promise<{
  id: string
  clerkId: string
  email: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  isNew: boolean
}> {
  const { userId: clerkId } = await auth()
  if (!clerkId) throw new Error("Unauthorized")

  // 1. Check if PostgreSQL user already exists
  let dbUser = await prisma.user.findUnique({ where: { clerkId } })

  if (dbUser) {
    console.log(`[auth] Existing user: ${clerkId}`)
    return {
      id: dbUser.id,
      clerkId: dbUser.clerkId,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      avatarUrl: dbUser.avatarUrl,
      isNew: false,
    }
  }

  // 2. Fetch full user profile from Clerk (session claims alone are not enough)
  const clerkUser = await currentUser()

  if (!clerkUser) {
    throw new Error("Unauthorized")
  }

  const primaryEmail =
    clerkUser.emailAddresses?.find((e: any) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses?.[0]?.emailAddress ?? "unknown@email.com"
  const firstName = clerkUser.firstName ?? "User"
  const lastName = clerkUser.lastName ?? null
  const avatarUrl = clerkUser.imageUrl ?? null

  // 3. Create PostgreSQL user record
  dbUser = await prisma.user.create({
    data: {
      clerkId,
      email: primaryEmail,
      firstName,
      lastName,
      avatarUrl,
    },
  })

  console.log(`[auth] Created user: ${clerkId} (${primaryEmail})`)
  return {
    id: dbUser.id,
    clerkId: dbUser.clerkId,
    email: dbUser.email,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    avatarUrl: dbUser.avatarUrl,
    isNew: true,
  }
}

/**
 * Legacy helper that returns just the user ID.
 * Prefer getOrCreateUser() for new code.
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await getOrCreateUser()
  return user.id
}

export async function getWorkspaceOrThrow(workspaceId: string) {
  const userId = await getCurrentUserId()
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId },
    include: { conversations: { orderBy: { createdAt: "desc" } } },
  })
  if (!workspace) throw new Error("Workspace not found")
  return workspace
}