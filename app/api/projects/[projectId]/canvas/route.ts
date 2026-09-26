import { put, get } from '@vercel/blob';

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

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
    const pathname = `canvas/${projectId}.json`;

    // Upload to Vercel Blob
    await put(pathname, canvasData, {
      access: 'private',
      contentType: 'application/json',
      allowOverwrite: true,
    });

    // Update project record with the new blob URL
    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: pathname },
    });

    return NextResponse.json({ pathname }, { status: 200 });
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
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

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

    // Get from vercel blob
    const result = await get(project.canvasJsonPath, {
      access: 'private',
      useCache: false,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json(
        { error: 'Canvas blob not found' },
        { status: 404 },
      );
    }

    const data = await new Response(result.stream).json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Canvas Load Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
