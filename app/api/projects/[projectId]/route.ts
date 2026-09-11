import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return new NextResponse('Not found', { status: 404 });
  }

  if (project.ownerId !== userId) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const body: { name?: string } = await req.json().catch(() => ({}));
  const name = body.name?.trim();

  if (!name) {
    return new NextResponse('Bad request: missing name', { status: 400 });
  }

  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { name },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
): Promise<NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return new NextResponse('Not found', { status: 404 });
  }

  if (project.ownerId !== userId) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  await prisma.project.delete({
    where: { id: project.id },
  });

  return new NextResponse(null, { status: 204 });
}
