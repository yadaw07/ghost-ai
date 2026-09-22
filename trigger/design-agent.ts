import { task, wait } from '@trigger.dev/sdk/v3';
import { logger } from '@trigger.dev/sdk';

import { z } from 'zod';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, Output } from 'ai';

import type { CanvasNode, TCanvasEdge } from '@/types/canvas';
import { mutateFlow } from '@liveblocks/react-flow/node';

import { getLiveblocksClient } from '@/lib/liveblocks';
import { NODE_COLORS } from '@/types/canvas';

const AI_USER_ID = 'ghost-ai';
const STATUS_FEED_ID = 'ai-status'; // must match the feed your client reads

// @ai-sdk/google reads GOOGLE_GENERATIVE_AI_API_KEY by default, so pass ours.
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

const shape = z.enum([
  'rectangle',
  'circle',
  'diamond',
  'pill',
  'cylinder',
  'hexagon',
]);
const color = z.enum([
  'neutral',
  'blue',
  'purple',
  'orange',
  'red',
  'pink',
  'green',
  'teal',
]);
const position = z.object({ x: z.number(), y: z.number() });

// Schema for the AI's changes to the canvas
const DesignSchema = z.object({
  // add node / add edge
  nodes: z.array(
    z.object({
      id: z.string(),
      position,
      data: z.object({ label: z.string(), color, shape }),
    }),
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      data: z.object({ label: z.string() }),
    }),
  ),
  // move / resize / update data on nodes that already exist
  updateNodes: z.array(
    z.object({
      id: z.string(),
      position: position.optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      data: z
        .object({
          label: z.string().optional(),
          color: color.optional(),
          shape: shape.optional(),
        })
        .optional(),
    }),
  ),
  // delete node / delete edge
  deleteNodeIds: z.array(z.string()),
  deleteEdgeIds: z.array(z.string()),
});

// Drop undefined values so they don't overwrite existing data.
const defined = (obj: object = {}) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

export const designAgent = task({
  id: 'design-agent',
  run: async (payload: {
    prompt: string;
    roomId: string;
    projectId: string;
  }) => {
    const { prompt, roomId } = payload;
    const lb = getLiveblocksClient();

    logger.log('Design Agent started', { payload });

    // AI presence: shows "Ghost AI" in the room with a cursor + thinking state.
    // Presence and status are cosmetic, so a failure here must never stop the task.
    const setPresence = async (
      thinking: boolean,
      cursor: { x: number; y: number } | null = null,
      ttl = 60,
    ) => {
      try {
        await lb.setPresence(roomId, {
          userId: AI_USER_ID,
          data: { thinking, cursor },
          userInfo: { name: 'Ghost AI' },
          ttl,
        });
      } catch (err) {
        logger.warn('setPresence failed', { err });
      }
    };

    // Shared status feed: every user in the room sees these messages.
    const postStatus = async (
      status: 'started' | 'processing' | 'completed' | 'error',
      message: string,
    ) => {
      try {
        await lb.createFeedMessage({
          roomId,
          feedId: STATUS_FEED_ID,
          data: { type: 'ai-status', status, message },
        });
      } catch (err) {
        logger.warn('createFeedMessage failed', { err });
      }
    };

    try {
      // 1. Start: create the feed if needed, show status + presence
      try {
        await lb.createFeed({ roomId, feedId: STATUS_FEED_ID });
      } catch {
        // feed already exists
      }
      await postStatus('started', 'Architect is thinking...');
      await setPresence(true, null, 120);

      // 2. Generate changes using Gemini, given what's already on the canvas
      const canvas = await lb
        .getStorageDocument(roomId, 'json')
        .catch(() => ({}));

      console.log('Current Liveblocks storage', {
        canvas,
      });

      const { output } = await generateText({
        model: google('gemini-3.6-flash'),
        output: Output.object({ schema: DesignSchema }),
        instructions: `You are a world-class System Design Architect.
        Your goal is to map a user's system description onto a collaborative canvas.

        Constraints:
        - Use only the following node shapes: rectangle, circle, diamond, pill, cylinder, hexagon.
        - Use only these color keys: ${Object.keys(NODE_COLORS).join(', ')}.
        - Provide a clean, logical layout. Avoid overlapping nodes.
        - Coordinates should be centered around (0,0) and spaced realistically (e.g., 200-400px apart).
        - Ensure every edge source and target corresponds to a node ID (new or existing).
        - Reuse the IDs of existing nodes when changing them, and never re-add existing nodes.
        - Place new nodes in free space, not on top of existing ones.
        - Only update or delete existing things if the user asks for it.
        - Use empty arrays for anything you don't need to change.`,
        prompt: `Current canvas:\n${JSON.stringify(canvas)}\n\nUser request:\n${prompt}`,
      });

      if (!output) throw new Error('AI failed to generate a design');

      // 3. Apply changes to the canvas one by one for a "live" feel
      await postStatus('processing', 'Updating the canvas...');

      await mutateFlow<CanvasNode, TCanvasEdge>(
        {
          client: lb,
          roomId,
        },
        async (flow) => {
          const moveCursor = async (cursor?: { x: number; y: number }) => {
            await setPresence(true, cursor ?? null, 30);
            await wait.for({ seconds: 0.2 });
          };

          // Delete edges
          for (const id of output.deleteEdgeIds) {
            flow.removeEdge(id);
            await moveCursor();
          }

          // Delete nodes
          for (const id of output.deleteNodeIds) {
            flow.removeNode(id);
            await moveCursor();
          }

          // Update existing nodes
          for (const update of output.updateNodes) {
            const node = flow.getNode(update.id);

            if (!node) {
              logger.warn('Skipping update for missing node', {
                nodeId: update.id,
              });

              continue;
            }

            flow.updateNode(update.id, {
              ...(update.position && {
                position: update.position,
              }),
            });

            if (update.data) {
              flow.updateNodeData(update.id, defined(update.data));
            }

            await moveCursor(update.position);
          }

          // Add new nodes
          for (const node of output.nodes) {
            flow.addNode({
              id: node.id,
              type: 'shape',
              position: node.position,
              data: node.data,
            });

            await moveCursor(node.position);
          }

          // Add new edges
          for (const edge of output.edges) {
            if (!flow.getNode(edge.source) || !flow.getNode(edge.target)) {
              logger.warn('Skipping edge with missing node', {
                edge,
              });

              continue;
            }

            flow.addEdge({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              type: 'canvas',
              data: edge.data,
            });

            await moveCursor();
          }
        },
      );

      // 4. Finalization
      await postStatus('completed', 'Architecture design complete!');

      logger.log('Design Agent successfully completed the architecture');

      return {
        status: 'completed',
        nodeCount: output.nodes.length,
        edgeCount: output.edges.length,
      };
    } catch (error) {
      logger.error('Design Agent failed', { error });
      await postStatus(
        'error',
        'Something went wrong with the design process.',
      );
      throw error;
    } finally {
      // Clear AI presence. There is no "remove" call, so a 2s TTL (the minimum) does it.
      await setPresence(false, null, 2);
    }
  },
});
