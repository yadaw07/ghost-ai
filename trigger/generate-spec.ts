import { task, logger } from '@trigger.dev/sdk/v3';
import { z } from 'zod';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { put } from '@vercel/blob';

import { prisma } from '@/lib/prisma';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
});

const SpecInputSchema = z.object({
  projectId: z.string().min(1),
  roomId: z.string().min(1),
  chatHistory: z.array(ChatMessageSchema).default([]),
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

export const generateSpec = task({
  id: 'generate-spec',
  run: async (payload: {
    projectId: string;
    roomId: string;
    chatHistory: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }>;
    nodes: Array<Record<string, unknown>>;
    edges: Array<Record<string, unknown>>;
  }) => {
    const input = SpecInputSchema.parse(payload);

    logger.log('Spec generation started', {
      projectId: input.projectId,
      roomId: input.roomId,
      nodeCount: input.nodes.length,
      edgeCount: input.edges.length,
      chatCount: input.chatHistory.length,
    });

    const chatSummary = input.chatHistory.length
      ? input.chatHistory
          .map(
            (message: { role: 'user' | 'assistant' | 'system'; content: string }) =>
              `${message.role}: ${message.content}`,
          )
          .join('\n')
      : 'No chat history provided.';

    const canvasSummary = JSON.stringify(
      {
        nodes: input.nodes,
        edges: input.edges,
      },
      null,
      2,
    );

    const { text } = await generateText({
      model: google('gemini-3.6-flash'),
      system: `You are a senior systems architect. Create a clear technical design specification in Markdown based on the project canvas and chat context. Output only Markdown, with headings and concise sections. Keep it practical, production-oriented, and grounded in the actual nodes and edges provided. Include sections such as Overview, Architecture, Data Flow, Components, Risks, and Next Steps.`,
      prompt: `Project ID: ${input.projectId}\nRoom ID: ${input.roomId}\n\nChat context:\n${chatSummary}\n\nCanvas graph:\n${canvasSummary}`,
    });

    const markdown = text.trim();
    const filePath = `specs/${input.projectId}/${crypto.randomUUID()}.md`;

    await put(filePath, markdown, {
      access: 'private',
      contentType: 'text/markdown; charset=utf-8',
      allowOverwrite: true,
    });

    const specRecord = await prisma.projectSpec.create({
      data: {
        projectId: input.projectId,
        filePath,
      },
      select: {
        id: true,
        projectId: true,
        filePath: true,
        createdAt: true,
      },
    });

    logger.log('Spec generation completed', {
      projectId: input.projectId,
      roomId: input.roomId,
      markdownLength: markdown.length,
      filePath,
      specId: specRecord.id,
    });

    return markdown;
  },
});
