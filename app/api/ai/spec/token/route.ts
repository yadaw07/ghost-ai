import { auth as clerkAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { auth } from '@trigger.dev/sdk/v3';

const SpecTokenRequestSchema = z.object({
  runId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const { userId } = await clerkAuth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = SpecTokenRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse('Missing runId', { status: 400 });
    }

    const { runId } = parsed.data;

    const taskRun = await prisma.taskRun.findUnique({
      where: { runId },
      select: { userId: true },
    });

    if (!taskRun) {
      return new NextResponse('Task run not found', { status: 404 });
    }

    if (taskRun.userId !== userId) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const token = await auth.createPublicToken({
      expiresIn: 60 * 60,
      scopes: {
        read: {
          runs: [runId],
        },
      },
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating spec token:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
