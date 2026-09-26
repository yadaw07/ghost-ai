'use client';

import { memo } from 'react';
import { useOther, useOthersConnectionIds } from '@liveblocks/react';

import { Loader2 } from 'lucide-react';

interface CursorProps {
  connectionId: number;
}

const Cursor = memo(function Cursor({ connectionId }: CursorProps) {
  const user = useOther(connectionId, (other) => ({
    cursor: other.presence.cursor,
    thinking: other.presence.thinking,
    name: other.info?.name ?? 'Anonymous',
    color: other.info?.color ?? '#6366f1',
  }));

  if (!user?.cursor) return null;

  return (
    <div
      className='pointer-events-none absolute left-0 top-0 z-30'
      style={{
        transform: `translate(${user.cursor.x}px, ${user.cursor.y}px)`,
      }}
    >
      <svg
        width='16'
        height='20'
        viewBox='0 0 16 20'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='drop-shadow-sm'
      >
        <path
          d='M1 1L14.5 8.5L8.5 10L6 16.5L1 1Z'
          fill={user.color}
          stroke='white'
          strokeWidth='1'
        />
      </svg>

      <div
        className='ml-3 mt-0.5 flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-medium text-white shadow-sm'
        style={{
          backgroundColor: user.color,
        }}
      >
        {user.thinking && <Loader2 className='h-2.5 w-2.5 animate-spin' />}
        {user.name}
      </div>
    </div>
  );
});

export function LiveCursors() {
  const connectionIds = useOthersConnectionIds();

  return (
    <>
      {connectionIds.map((connectionId) => (
        <Cursor key={connectionId} connectionId={connectionId} />
      ))}
    </>
  );
}
