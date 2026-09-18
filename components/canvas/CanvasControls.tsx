'use client';

import { ZoomIn, ZoomOut, Maximize, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function CanvasControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: CanvasControlsProps) {
  return (
    <div className='fixed bottom-6 left-6 z-30 flex items-center gap-1 rounded-full border border-border bg-surface/80 p-1 backdrop-blur-md shadow-sm'>
      <div className='flex items-center gap-1'>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 rounded-full'
          onClick={onZoomOut}
        >
          <ZoomOut className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 rounded-full'
          onClick={onFitView}
        >
          <Maximize className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 rounded-full'
          onClick={onZoomIn}
        >
          <ZoomIn className='h-4 w-4' />
        </Button>
      </div>

      <div className='mx-1 h-6 w-px bg-border' />

      <div className='flex items-center gap-1'>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 rounded-full'
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo2 className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 rounded-full'
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo2 className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
