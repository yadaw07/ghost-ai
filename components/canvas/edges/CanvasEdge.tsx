'use client';

import React, { useState, useCallback, useEffect, useContext } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
} from '@xyflow/react';

import { cn } from '@/lib/utils';
import { CanvasContext } from '@/components/canvas/CollaborativeCanvas';

export function CanvasEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
  data,
}: EdgeProps) {
  const context = useContext(CanvasContext);

  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState((data?.label ?? '') as string);

  const handleEdgeEnter = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }

    setIsHovered(true);
  };

  const handleEdgeLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    setLabel((data?.label ?? '') as string);
  }, [data?.label]);

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onDoubleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);

    if (context?.onLabelChange) {
      context.onLabelChange(id as string, label);
    }
  }, [context, id, label]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === 'Escape') {
        setIsEditing(false);

        if (event.key === 'Enter' && context?.onLabelChange) {
          context.onLabelChange(id as string, label);
        }
      }
    },
    [context, id, label],
  );

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        interactionWidth={20}
        className={cn(
          'transition-colors duration-200',
          selected
            ? 'stroke-primary stroke-[2px]'
            : 'stroke-muted-foreground/40 hover:stroke-muted-foreground/80 stroke-[1.5px]',
        )}
        style={{
          strokeLinecap: 'round',
        }}
        onDoubleClick={onDoubleClick}
      />

      {/* Invisible hover target */}
      <path
        d={path}
        fill='none'
        stroke='transparent'
        strokeWidth={20}
        pointerEvents='stroke'
        onMouseEnter={handleEdgeEnter}
        onMouseLeave={handleEdgeLeave}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'all',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          onDoubleClick={onDoubleClick}
          onMouseEnter={handleEdgeEnter}
          onMouseLeave={handleEdgeLeave}
        >
          {isEditing ? (
            <input
              autoFocus
              className='min-w-12 w-auto rounded border border-primary bg-background px-2 py-1 text-xs outline-none'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === ' ') {
                  e.stopPropagation();
                }

                handleKeyDown(e);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : label ? (
            <div className='cursor-pointer select-none rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm'>
              {label}
            </div>
          ) : (
            isHovered && (
              <div className='cursor-pointer select-none rounded-full border border-dashed border-muted-foreground/30 bg-transparent px-2 py-0.5 text-[10px] text-muted-foreground/30 transition-all hover:border-muted-foreground/50'>
                Add label...
              </div>
            )
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
