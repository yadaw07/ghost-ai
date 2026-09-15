import { Liveblocks } from '@liveblocks/node';

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

export function getCursorColor(userId: string): (typeof CURSOR_COLORS)[number] {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }

  // Return the cursor color based on the user ID
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}
