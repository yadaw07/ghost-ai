import { put } from '@vercel/blob';

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = params;

    // Verify project membership/ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { collaborators: { some: { id: userId } } }],
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { nodes, edges } = body;

    if (!nodes || !edges) {
      return NextResponse.json(
        { error: 'Missing canvas data' },
        { status: 400 },
      );
    }

    const canvasData = JSON.stringify({ nodes, edges });
    const filename = `canvas/${projectId}-${Date.now()}.json`;

    // Upload to Vercel Blob
    const { url } = await put(filename, canvasData, {
      access: 'public',
      contentType: 'application/json',
    });

    // Update project record with the new blob URL
    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: url },
    });

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error('Canvas Save Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = params;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { collaborators: { some: { id: userId } } }],
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!project.canvasJsonPath) {
      return NextResponse.json({ nodes: [], edges: [] }, { status: 200 });
    }

    // Fetch from vercel blob
    const response = await fetch(project.canvasJsonPath);
    if (!response.ok) {
      throw new Error('Failed to fetch canvas blob');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Canvas Load Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
