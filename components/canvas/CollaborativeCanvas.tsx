'use client';

import React, { useCallback, useRef, useState, createContext } from 'react';

import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useLiveblocksFlow } from '@liveblocks/react-flow';

import { ShapePanel } from './ShapePanel';
import { ShapeNode } from './nodes/ShapeNode';
import { CanvasEdge } from './edges/CanvasEdge';

import { ColorToolbar } from './ColorToolbar';
import { CanvasNode, NodeData, NodeColorKey } from '@/types/canvas';
import { cn } from '@/lib/utils';

const nodeTypes = {
  shape: ShapeNode,
};

const edgeTypes = {
  canvas: CanvasEdge,
};

interface CanvasContextType {
  onLabelChange: (edgeId: string, newLabel: string) => void;
}

export const CanvasContext = createContext<CanvasContextType | null>(null);

export function CollaborativeCanvas() {
  const nodeCounter = useRef(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [dragPreview, setDragPreview] = useState<{
    shape: string;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const { screenToFlowPosition, flowToScreenPosition } = useReactFlow();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode>({ suspense: true });

  const handleLabelChange = useCallback(
    (edgeId: string, newLabel: string) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;
      onEdgesChange([
        {
          type: 'replace',
          id: edgeId,
          item: { ...edge, data: { ...edge.data, label: newLabel } },
        },
      ]);
    },
    [onEdgesChange, edges],
  );

  const selectedNode = nodes.find((n) => n.selected);
  const selectedNodePosition = selectedNode
    ? (() => {
        const screenPosition = flowToScreenPosition({
          x: selectedNode.position.x + (selectedNode.width || 150) / 2,
          y: selectedNode.position.y,
        });

        const rect = canvasRef.current?.getBoundingClientRect();

        if (!rect) return null;

        return {
          x: screenPosition.x - rect.left,
          y: screenPosition.y - rect.top,
        };
      })()
    : null;

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';

      if (dragPreview) {
        setDragPreview((prev) =>
          prev ? { ...prev, x: event.clientX, y: event.clientY } : null,
        );
      }
    },
    [dragPreview],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragPreview(null);

      const shapeData = event.dataTransfer.getData('application/reactflow');
      if (!shapeData) return;

      try {
        const { shape, width, height } = JSON.parse(shapeData);

        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        nodeCounter.current += 1;
        const nodeId = `${shape}-${Date.now()}-${nodeCounter.current}`;

        const newNode: CanvasNode = {
          id: nodeId,
          position,
          data: {
            shape: shape as NodeData['shape'],
            label: '',
            width,
            height,
            color: 'neutral',
          },
          type: 'shape',
        };

        onNodesChange([
          {
            type: 'add',
            item: newNode,
          },
        ]);
      } catch (error) {
        console.error('Failed to create canvas node:', error);
      }
    },
    [screenToFlowPosition, onNodesChange],
  );

  const handleDragStart = useCallback((shape: any, event: React.DragEvent) => {
    setDragPreview({
      shape: shape.type,
      x: event.clientX,
      y: event.clientY,
      width: shape.width,
      height: shape.height,
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragPreview(null);
  }, []);

  return (
    <CanvasContext.Provider value={{ onLabelChange: handleLabelChange }}>
      <div
        ref={canvasRef}
        className='h-full w-full relative'
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDelete={onDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{ type: 'canvas', data: { label: '' } }}
          fitView
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color='var(--color-border-subtle)'
          />
          <MiniMap
            className='rounded-lg! border! border-subtle! bg-surface!'
            nodeColor='var(--color-primary)'
          />
        </ReactFlow>
        <ShapePanel onDragStart={handleDragStart} onDragEnd={handleDragEnd} />

        {selectedNode && selectedNodePosition && (
          <ColorToolbar
            nodeId={selectedNode.id}
            currentColor={(selectedNode.data.color as NodeColorKey) || 'neutral'}
            position={selectedNodePosition}
          />
        )}

        {dragPreview && (
          <div
            className='pointer-events-none fixed z-100 opacity-50'
            style={{
              left: dragPreview.x,
              top: dragPreview.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={cn(
                'border-2 border-primary bg-background transition-colors',
                dragPreview.shape === 'circle' && 'rounded-full',
                dragPreview.shape === 'pill' && 'rounded-full',
                dragPreview.shape === 'rectangle' && 'rounded-md',
              )}
              style={{
                width: dragPreview.width,
                height: dragPreview.height,
              }}
            >
              {['diamond', 'hexagon', 'cylinder'].includes(dragPreview.shape) && (
                <div className='relative w-full h-full'>
                  {/* Simplified SVG preview for complex shapes */}
                  <svg
                    width={dragPreview.width}
                    height={dragPreview.height}
                    className='absolute inset-0'
                  >
                    {dragPreview.shape === 'diamond' && (
                      <polygon
                        points={`${dragPreview.width / 2},0 ${dragPreview.width},${dragPreview.height / 2} ${dragPreview.width / 2},${dragPreview.height} 0,${dragPreview.height / 2}`}
                        fill='var(--color-background)'
                        stroke='var(--color-primary)'
                        strokeWidth='2'
                      />
                    )}
                    {dragPreview.shape === 'hexagon' && (
                      <polygon
                        points={`${dragPreview.width * 0.25},0 ${dragPreview.width * 0.75},0 ${dragPreview.width},${dragPreview.height / 2} ${dragPreview.width * 0.75},${dragPreview.height} ${dragPreview.width * 0.25},${dragPreview.height} 0,${dragPreview.height / 2}`}
                        fill='var(--color-background)'
                        stroke='var(--color-primary)'
                        strokeWidth='2'
                      />
                    )}
                    {dragPreview.shape === 'cylinder' && (
                      <path
                        d={`M 20,0 L ${dragPreview.width - 20},0 A 20,20 0 0 1 ${dragPreview.width},20 L ${dragPreview.width},${dragPreview.height - 20} A 20,20 0 0 1 ${dragPreview.width - 20},${dragPreview.height} L 20,${dragPreview.height} A 20,20 0 0 1 0,${dragPreview.height - 20} L 0,20 A 20,20 0 0 1 20,0`}
                        fill='var(--color-background)'
                        stroke='var(--color-primary)'
                        strokeWidth='2'
                      />
                    )}
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CanvasContext.Provider>
  );
}
