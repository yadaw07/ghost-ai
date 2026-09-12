import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export interface ClerkIdentity {
  userId: string | null;
  primaryEmail: string | null;
}

/**
 * Get current Clerk identity — user ID and primary email address.
 */
export async function getCurrentClerkIdentity(): Promise<ClerkIdentity> {
  const { userId } = await auth();
  if (!userId) return { userId: null, primaryEmail: null };

  // Clerk's `currentUser()` is a server‑side helper that works in a
  // server component. It returns a `User` object with the primary
  // email under `emailAddresses`.
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  return { userId, primaryEmail: email };
}

/**
 * Determine if the current user has access to the requested project.
 *
 * A user has access if they own the project or are listed as a
 * collaborator by their primary email address.
 */
export async function checkProjectAccess(
  userId: string,
  primaryEmail: string | null,
  projectId: string,
): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  });

  if (!project) return false;

  if (project.ownerId === userId) return true;

  if (!primaryEmail) return false;

  return project.collaborators.some((c) => c.email === primaryEmail);
}

/**
 * Fetch a project by ID, selecting only the fields needed for the shell.
 */
export async function getProjectById(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true },
  });
}
