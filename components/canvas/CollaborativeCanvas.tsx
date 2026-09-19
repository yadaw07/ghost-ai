'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
} from 'react';

import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useLiveblocksFlow } from '@liveblocks/react-flow';
import { useHistory, useMyPresence } from '@liveblocks/react';

import { ShapeNode } from './nodes/ShapeNode';
import { CanvasEdge } from './edges/CanvasEdge';

import { ShapePanel } from './ShapePanel';
import { CanvasControls } from './CanvasControls';
import { ColorToolbar } from './ColorToolbar';

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import {
  CanvasNode,
  TCanvasEdge,
  NodeData,
  NodeColorKey,
} from '@/types/canvas';
import { cn } from '@/lib/utils';
import type { CanvasTemplate } from '@/components/editor/starter-templates';

import { CollaboratorAvatars } from './CollaboratorAvatars';
import { LiveCursors } from './LiveCursors';

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

interface CollaborativeCanvasProps {
  templateToImport: CanvasTemplate | null;
  onTemplateImported: () => void;
}

export function CollaborativeCanvas({
  templateToImport,
  onTemplateImported,
}: CollaborativeCanvasProps) {
  const nodeCounter = useRef(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [dragPreview, setDragPreview] = useState<{
    shape: string;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const reactFlow = useReactFlow();
  const {
    screenToFlowPosition,
    flowToScreenPosition,
    zoomIn,
    zoomOut,
    fitView,
  } = reactFlow;

  const { undo, redo, canUndo, canRedo } = useHistory();

  const [, updateMyPresence] = useMyPresence();

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, TCanvasEdge>({ suspense: true });

  const handleFitView = useCallback(() => {
    fitView({ duration: 200 });
  }, [fitView]);

  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();

      if (!rect) return;

      updateMyPresence({
        cursor: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
      });
    },
    [updateMyPresence],
  );

  const handleCanvasMouseLeave = useCallback(() => {
    updateMyPresence({
      cursor: null,
    });
  }, [updateMyPresence]);

  useKeyboardShortcuts(reactFlow, undo, redo);

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

  useEffect(() => {
    if (!templateToImport) return;

    onEdgesChange([
      ...edges.map((edge) => ({ type: 'remove' as const, id: edge.id })),
      ...templateToImport.edges.map((edge) => ({
        type: 'add' as const,
        item: edge,
      })),
    ]);

    onNodesChange([
      ...nodes.map((node) => ({ type: 'remove' as const, id: node.id })),
      ...templateToImport.nodes.map((node) => ({
        type: 'add' as const,
        item: node,
      })),
    ]);

    onTemplateImported();
    const fitViewFrame = window.requestAnimationFrame(() => {
      fitView({ duration: 200, padding: 0.2 });
    });

    return () => window.cancelAnimationFrame(fitViewFrame);
  }, [
    edges,
    fitView,
    nodes,
    onEdgesChange,
    onNodesChange,
    onTemplateImported,
    templateToImport,
  ]);

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
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          defaultEdgeOptions={{
            type: 'canvas',
            data: { label: '' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          }}
          fitView
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color='var(--color-border-subtle)'
          />
          <LiveCursors />

          <MiniMap
            className='rounded-lg! border! border-subtle! bg-surface!'
            nodeColor='var(--color-primary)'
          />
        </ReactFlow>

        <CollaboratorAvatars />
        <CanvasControls
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitView={handleFitView}
          onUndo={undo}
          onRedo={redo}
          canUndo={Boolean(canUndo)}
          canRedo={Boolean(canRedo)}
        />
        <ShapePanel onDragStart={handleDragStart} onDragEnd={handleDragEnd} />

        {selectedNode && selectedNodePosition && (
          <ColorToolbar
            nodeId={selectedNode.id}
            currentColor={
              (selectedNode.data.color as NodeColorKey) || 'neutral'
            }
            position={selectedNodePosition}
          />
        )}

        {/* A temporary visual preview while you're dragging a shape from the ShapePanel. */}
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
              {['diamond', 'hexagon', 'cylinder'].includes(
                dragPreview.shape,
              ) && (
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
