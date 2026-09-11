import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(): Promise<NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: Request): Promise<NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const name: string = body?.name ?? 'Untitled Project';
  const slug: string = body?.slug;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        ownerId: userId,
        slug,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error(error);

    return new NextResponse('Internal server error', {
      status: 500,
    });
  }
}
