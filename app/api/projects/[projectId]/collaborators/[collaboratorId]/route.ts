import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: Request,
  {
    params,
  }: { params: Promise<{ projectId: string; collaboratorId: string }> },
): Promise<NextResponse> {
  const { userId } = await auth();

  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId, collaboratorId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (project.ownerId !== userId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const collaborator = await prisma.projectCollaborator.findFirst({
    where: { id: collaboratorId, projectId },
  });

  if (!collaborator)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.projectCollaborator.delete({ where: { id: collaborator.id } });

  return new NextResponse(null, { status: 204 });
}
