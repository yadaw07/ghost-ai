'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { LiveblocksProvider, RoomProvider } from '@liveblocks/react';
import { ClientSideSuspense } from '@liveblocks/react/suspense';

import { CollaborativeCanvas } from './CollaborativeCanvas';
import type { CanvasTemplate } from '@/components/editor/starter-templates';

interface CanvasWrapperProps {
  roomId: string;
  activeProjectId: string;
  onSaveStatusChange: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  templateToImport: CanvasTemplate | null;
  onTemplateImported: () => void;
}

export function CanvasWrapper({
  roomId,
  activeProjectId,
  onSaveStatusChange,
  templateToImport,
  onTemplateImported,
}: CanvasWrapperProps) {
  return (
    <ClientSideSuspense fallback={<CanvasLoading />}>
      {/* ReactFlowProvider is required to use hooks like useReactFlow in child components */}
      <ReactFlowProvider>
        <CollaborativeCanvas
          activeProjectId={activeProjectId}
          onSaveStatusChange={onSaveStatusChange}
          templateToImport={templateToImport}
          onTemplateImported={onTemplateImported}
        />
      </ReactFlowProvider>
    </ClientSideSuspense>
  );
}

function CanvasLoading() {
  return (
    <div className='flex h-full w-full items-center justify-center text-sm text-muted-foreground'>
      Loading collaborative canvas...
    </div>
  );
}
