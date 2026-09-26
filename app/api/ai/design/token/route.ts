import { auth as clerkAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { auth } from '@trigger.dev/sdk/v3';

export async function POST(req: Request) {
  try {
    const { userId } = await clerkAuth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { runId } = await req.json();

    if (!runId) {
      return new NextResponse('Missing runId', { status: 400 });
    }

    // Verify ownership of the run
    const taskRun = await prisma.taskRun.findUnique({
      where: { runId },
    });

    if (!taskRun) {
      return new NextResponse('Task run not found', { status: 404 });
    }

    if (taskRun.userId !== userId) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Generate a Trigger.dev public token scoped to this run
    // Note: In Trigger.dev v3, run-scoped tokens are handled via the SDK/API.
    // For the purpose of this implementation, we will use the SDK to get a token.
    const token = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [runId], // only this run
        },
      },
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating design token:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
