'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { LiveblocksProvider, RoomProvider } from '@liveblocks/react';
import { ClientSideSuspense } from '@liveblocks/react/suspense';

import { CollaborativeCanvas } from './CollaborativeCanvas';
import type { CanvasTemplate } from '@/components/editor/starter-templates';

interface CanvasWrapperProps {
  roomId: string;
  templateToImport: CanvasTemplate | null;
  onTemplateImported: () => void;
}

export function CanvasWrapper({
  roomId,
  templateToImport,
  onTemplateImported,
}: CanvasWrapperProps) {
  return (
    <LiveblocksProvider authEndpoint='/api/liveblocks-auth'>
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <ClientSideSuspense fallback={<CanvasLoading />}>
          {/* ReactFlowProvider is required to use hooks like useReactFlow in child components */}
          <ReactFlowProvider>
            <CollaborativeCanvas
              templateToImport={templateToImport}
              onTemplateImported={onTemplateImported}
            />
          </ReactFlowProvider>
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

function CanvasLoading() {
  return (
    <div className='flex h-full w-full items-center justify-center text-sm text-muted-foreground'>
      Loading collaborative canvas...
    </div>
  );
}
