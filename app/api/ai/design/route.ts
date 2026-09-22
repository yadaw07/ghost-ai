import { auth as clerkAuth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { tasks } from '@trigger.dev/sdk/v3';
import type { designAgent } from '@/trigger/design-agent';

export async function POST(req: Request) {
  try {
    const { userId } = await clerkAuth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    const { prompt, roomId, projectId } = await req.json();

    if (!prompt || !roomId || !projectId) {
      return new NextResponse(
        'Missing required fields: prompt, roomId, projectId',
        { status: 400 },
      );
    }

    // Verify project ownership or collaboration
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { collaborators: { some: { email: { equals: email } } } },
        ],
      },
    });

    // Fallback check: Just verify the project exists and user is authenticated for now,
    // but we should ideally verify the user is actually a collaborator.
    // Since ProjectCollaborator uses email, and auth() provides userId,
    // we'll check if the user is the owner.
    if (!project) {
      // In a real scenario, we'd look up the user's email from Clerk to check collaborators.
      // For this implementation, we'll verify ownerId for strictness.
      const ownerProject = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!ownerProject) {
        return new NextResponse('Project not found', { status: 404 });
      }

      // We'll allow the request if the user is the owner.
      if (ownerProject.ownerId !== userId) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    // Trigger the design task
    const run = await tasks.trigger<typeof designAgent>('design-agent', {
      prompt,
      roomId,
      projectId,
    });

    // Create a TaskRun record to track ownership
    await prisma.taskRun.create({
      data: {
        runId: run.id,
        projectId,
        userId,
      },
    });

    return NextResponse.json({ runId: run.id });
  } catch (error) {
    console.error('Error triggering design agent:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
