import { auth as clerkAuth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

import { tasks } from '@trigger.dev/sdk/v3';
import type { generateSpec } from '@/trigger/generate-spec';

const SpecRequestSchema = z.object({
  roomId: z.string().min(1),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1),
      }),
    )
    .default([]),
  nodes: z
    .array(
      z
        .object({
          id: z.string().min(1),
        })
        .passthrough(),
    )
    .default([]),
  edges: z
    .array(
      z
        .object({
          id: z.string().min(1),
          source: z.string().min(1),
          target: z.string().min(1),
        })
        .passthrough(),
    )
    .default([]),
});

export async function POST(req: Request) {
  try {
    const { userId } = await clerkAuth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await currentUser();
    const primaryEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

    const body = await req.json().catch(() => null);
    const parsed = SpecRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse('Invalid request payload', { status: 400 });
    }

    const { roomId, chatHistory, nodes, edges } = parsed.data;

    const project = await prisma.project.findFirst({
      where: primaryEmail
        ? {
            id: roomId,
            OR: [
              { ownerId: userId },
              {
                collaborators: {
                  some: {
                    email: {
                      equals: primaryEmail,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            ],
          }
        : {
            id: roomId,
            ownerId: userId,
          },
      select: { id: true, ownerId: true },
    });

    if (!project) {
      const ownerProject = await prisma.project.findUnique({
        where: { id: roomId },
        select: { id: true, ownerId: true },
      });

      if (!ownerProject) {
        return new NextResponse('Project not found', { status: 404 });
      }

      if (ownerProject.ownerId !== userId) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    const run = await tasks.trigger<typeof generateSpec>('generate-spec', {
      projectId: roomId,
      roomId,
      chatHistory,
      nodes,
      edges,
    });

    await prisma.taskRun.create({
      data: {
        runId: run.id,
        projectId: roomId,
        userId,
      },
    });

    return NextResponse.json({ runId: run.id });
  } catch (error) {
    console.error('Error triggering spec generation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
