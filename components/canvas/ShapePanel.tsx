'use client';

import React from 'react';
import { Square, Diamond, Circle, Pill, Cylinder, Hexagon } from 'lucide-react';
import { cn } from '@/lib/utils';

const SHAPES = [
  {
    type: 'rectangle',
    icon: Square,
    label: 'Rectangle',
    width: 180,
    height: 100,
  },
  {
    type: 'diamond',
    icon: Diamond,
    label: 'Diamond',
    width: 160,
    height: 140,
  },
  { type: 'circle', icon: Circle, label: 'Circle', width: 120, height: 120 },
  { type: 'pill', icon: Pill, label: 'Pill', width: 180, height: 80 },
  {
    type: 'cylinder',
    icon: Cylinder,
    label: 'Cylinder',
    width: 160,
    height: 120,
  },
  { type: 'hexagon', icon: Hexagon, label: 'Hexagon', width: 160, height: 120 },
] as const;

export function ShapePanel() {
  // Handles the start of a drag operation by packing shape metadata into the dataTransfer object
  const handleDragStart = (
    event: React.DragEvent,
    shape: (typeof SHAPES)[number],
  ) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({
        shape: shape.type,
        width: shape.width,
        height: shape.height,
      }),
    );
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className='fixed bottom-8 left-1/2 -translate-x-1/2 z-50'>
      <div className='flex items-center gap-1 p-1.5 bg-background/80 backdrop-blur-md border border-border rounded-full shadow-xl'>
        {SHAPES.map((shape) => {
          const Icon = shape.icon;

          return (
            <button
              key={shape.type}
              draggable
              onDragStart={(event) => handleDragStart(event, shape)}
              className={cn(
                'cursor-grab rounded-full p-2 text-muted-foreground transition-all hover:bg-accent hover:text-foreground',
                'active:cursor-grabbing active:scale-90',
              )}
              title={shape.label}
            >
              <Icon className='h-5 w-5' />
            </button>
          );
        })}
      </div>
    </div>
  );
}
