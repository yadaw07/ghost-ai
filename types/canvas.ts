import type { Node, Edge } from '@xyflow/react';

export interface NodeData extends Record<string, unknown> {
  label: string;
  color: string;
  shape: 'rectangle' | 'circle' | 'diamond' | 'pill' | 'cylinder' | 'hexagon';
  width?: number;
  height?: number;
}

export type CanvasNode = Node<NodeData>;
export type CanvasEdge = Edge;
