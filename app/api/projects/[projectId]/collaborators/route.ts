import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

interface CollaboratorResponse {
  id: string;
  email: string;
  displayName: string | null;
  imageUrl: string | null;
}

async function getProjectForMember(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: { orderBy: { createdAt: 'asc' } } },
  });
  if (!project) return null;

  if (project.ownerId === userId) return project;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();

  return project.collaborators.some(
    (collaborator) => collaborator.email === email,
  )
    ? project
    : null;
}

// converts your DB's email-only collaborator data into UI-ready collaborator data using Clerk's user information.
async function enrichCollaborators(
  collaborators: { id: string; email: string }[],
): Promise<CollaboratorResponse[]> {
  if (collaborators.length === 0) return [];

  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({
    emailAddress: collaborators.map((collaborator) => collaborator.email),
    limit: collaborators.length,
  });

  const usersByEmail = new Map<string, (typeof users)[number]>();
  for (const user of users) {
    for (const address of user.emailAddresses) {
      usersByEmail.set(address.emailAddress.toLowerCase(), user);
    }
  }

  return collaborators.map((collaborator) => {
    const user = usersByEmail.get(collaborator.email);
    const displayName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(' ');
    return {
      id: collaborator.id,
      email: collaborator.email,
      displayName: displayName || user?.username || null,
      imageUrl: user?.imageUrl ?? null,
    };
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { userId } = await auth();

  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId } = await params;
  const project = await getProjectForMember(projectId, userId);

  if (!project)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    collaborators: await enrichCollaborators(project.collaborators),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (project.ownerId !== userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as { email?: unknown };
  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  const collaborator = await prisma.projectCollaborator.upsert({
    where: { projectId_email: { projectId, email } },
    create: { projectId, email },
    update: {},
  });
  const [enriched] = await enrichCollaborators([collaborator]);

  return NextResponse.json({ collaborator: enriched }, { status: 201 });
}
