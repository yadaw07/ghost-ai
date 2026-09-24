import { Liveblocks } from '@liveblocks/node';

export const LIVEBLOCKS_FEED_IDS = ['ai-chat', 'ai-status-feed'] as const;

export const CURSOR_COLORS = [
  '#E11D48',
  '#EA580C',
  '#D97706',
  '#16A34A',
  '#0891B2',
  '#2563EB',
  '#7C3AED',
  '#C026D3',
] as const;

interface LiveblocksGlobal {
  liveblocks?: Liveblocks;
}

const liveblocksGlobal = globalThis as typeof globalThis & LiveblocksGlobal;

function createLiveblocksClient(): Liveblocks {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error('LIVEBLOCKS_SECRET_KEY is not configured.');
  }

  return new Liveblocks({ secret });
}

export function getLiveblocksClient(): Liveblocks {
  if (!liveblocksGlobal.liveblocks) {
    liveblocksGlobal.liveblocks = createLiveblocksClient();
  }

  return liveblocksGlobal.liveblocks;
}

function isConflictError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 409
  );
}

export async function ensureLiveblocksFeed(
  roomId: string,
  feedId: string,
): Promise<void> {
  try {
    await getLiveblocksClient().createFeed({ roomId, feedId });
  } catch (error) {
    if (!isConflictError(error)) {
      throw error;
    }
  }
}

export function getCursorColor(userId: string): (typeof CURSOR_COLORS)[number] {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }

  // Return the cursor color based on the user ID
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}
