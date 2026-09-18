'use client';

import { useReactFlow } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NODE_COLORS, NodeColorKey } from '@/types/canvas';

interface ColorToolbarProps {
  nodeId: string;
  currentColor: NodeColorKey;
  position: { x: number; y: number };
}

export function ColorToolbar({
  nodeId,
  currentColor,
  position,
}: ColorToolbarProps) {
  const { updateNode } = useReactFlow();

  const updateNodeColor = (newColor: NodeColorKey) => {
    updateNode(nodeId, (node) => ({
      ...node,
      data: { ...node.data, color: newColor },
    }));
  };

  return (
    <div
      className='nodrag absolute z-50 flex gap-1.5 p-1.5 rounded-xl bg-surface border border-border-subtle shadow-xl'
      style={{
        left: position.x,
        top: position.y - 48, // Position slightly above the node
        transform: 'translateX(-50%)',
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {(Object.keys(NODE_COLORS) as NodeColorKey[]).map((key) => {
        const { bg, text } = NODE_COLORS[key];
        const isActive = currentColor === key;

        return (
          <button
            key={key}
            onClick={() => updateNodeColor(key)}
            className={cn(
              'h-5 w-5 rounded-full border transition-all duration-200 outline-none hover:scale-110',
              isActive
                ? 'border-white ring-2 ring-white/20 scale-110'
                : 'border-white/10',
            )}
            style={
              {
                backgroundColor: bg,
                boxShadow: isActive ? `0 0 0 2px ${text}40` : 'none',
                '--glow-color': text,
              } as React.CSSProperties
            }
            title={key}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  `0 0 8px ${text}`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }
            }}
          ></button>
        );
      })}
    </div>
  );
}
