'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';

export function ShapeNode({ data }: NodeProps) {
  // Renders a basic bordered box with a label.
  // This serves as the default visualization for all draggable shapes.
  return (
    <div className='group relative min-w-25 min-h-10 bg-background border-2 border-border rounded-md p-2 flex items-center justify-center text-center shadow-sm transition-colors hover:border-primary'>
      <Handle
        type='target'
        position={Position.Top}
        className='w-2 h-2 bg-border!'
      />

      <div className='text-xs font-medium text-muted-foreground group-hover:text-foreground'>
        {String(data.label || data.shape || 'Node')}
      </div>

      <Handle
        type='source'
        position={Position.Bottom}
        className='w-2 h-2 bg-border!'
      />
    </div>
  );
}
