'use client';

import React, { useCallback, useRef } from 'react';

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
import { CanvasNode, NodeData } from '@/types/canvas';

const nodeTypes = {
  shape: ShapeNode,
};

export function CollaborativeCanvas() {
  const nodeCounter = useRef(0);

  const { screenToFlowPosition } = useReactFlow();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode>({ suspense: true });

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

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
            color: 'var(--color-primary)',
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

  return (
    <div
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
      <ShapePanel />
    </div>
  );
}
