import { auth, currentUser } from '@clerk/nextjs/server';

import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; specId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, specId } = await params;

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          ...(email
            ? [
                {
                  collaborators: {
                    some: {
                      email: {
                        equals: email,
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                  },
                },
              ]
            : []),
        ],
      },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const spec = await prisma.projectSpec.findFirst({
      where: {
        id: specId,
        projectId,
      },
      select: {
        id: true,
        projectId: true,
        filePath: true,
      },
    });

    if (!spec) {
      return NextResponse.json({ error: 'Spec not found' }, { status: 404 });
    }

    const result = await get(spec.filePath, {
      access: 'private',
      useCache: false,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: 'Spec file not found' }, { status: 404 });
    }

    const markdown = await new Response(result.stream).text();
    const safeName = `${spec.id}.md`;

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeName}"`,
      },
    });
  } catch (error) {
    console.error('Spec download error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
