import type { CanvasEdge, CanvasNode, NodeData, NodeColorKey } from '@/types/canvas';

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

function createNode(
  id: string,
  label: string,
  shape: NodeData['shape'],
  color: NodeColorKey,
  x: number,
  y: number,
  width = 180,
  height = 80,
): CanvasNode {
  return {
    id,
    type: 'shape',
    position: { x, y },
    width,
    height,
    data: { label, shape, color, width, height },
  };
}

function createEdge(id: string, source: string, target: string): CanvasEdge {
  return {
    id,
    source,
    target,
    type: 'canvas',
    data: { label: '' },
  };
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: 'microservices',
    name: 'Microservices architecture',
    description: 'A gateway routes requests to independent services backed by shared infrastructure.',
    nodes: [
      createNode('gateway', 'API Gateway', 'hexagon', 'blue', 0, 100, 170, 100),
      createNode('users', 'Users service', 'rectangle', 'teal', 260, 0),
      createNode('orders', 'Orders service', 'rectangle', 'purple', 260, 120),
      createNode('database', 'Database', 'cylinder', 'orange', 560, 120, 170, 110),
      createNode('events', 'Event bus', 'pill', 'green', 560, 0),
    ],
    edges: [
      createEdge('gateway-users', 'gateway', 'users'),
      createEdge('gateway-orders', 'gateway', 'orders'),
      createEdge('users-events', 'users', 'events'),
      createEdge('orders-events', 'orders', 'events'),
      createEdge('orders-database', 'orders', 'database'),
    ],
  },
  {
    id: 'cicd',
    name: 'CI/CD pipeline',
    description: 'Code moves through validation, packaging, and deployment into production.',
    nodes: [
      createNode('commit', 'Commit', 'circle', 'blue', 0, 80, 110, 110),
      createNode('build', 'Build', 'rectangle', 'purple', 190, 95),
      createNode('test', 'Test', 'diamond', 'orange', 410, 75, 170, 120),
      createNode('deploy', 'Deploy', 'pill', 'green', 650, 100),
      createNode('production', 'Production', 'cylinder', 'teal', 890, 85, 170, 110),
    ],
    edges: [
      createEdge('commit-build', 'commit', 'build'),
      createEdge('build-test', 'build', 'test'),
      createEdge('test-deploy', 'test', 'deploy'),
      createEdge('deploy-production', 'deploy', 'production'),
    ],
  },
  {
    id: 'event-driven',
    name: 'Event-driven system',
    description: 'Producers publish events to a broker that fans out work to independent consumers.',
    nodes: [
      createNode('producer', 'Producer', 'pill', 'blue', 0, 110),
      createNode('broker', 'Message broker', 'cylinder', 'orange', 280, 85, 190, 130),
      createNode('worker', 'Worker', 'rectangle', 'green', 570, 0),
      createNode('notifications', 'Notifications', 'rectangle', 'pink', 570, 130),
      createNode('analytics', 'Analytics', 'hexagon', 'purple', 850, 65, 180, 110),
    ],
    edges: [
      createEdge('producer-broker', 'producer', 'broker'),
      createEdge('broker-worker', 'broker', 'worker'),
      createEdge('broker-notifications', 'broker', 'notifications'),
      createEdge('worker-analytics', 'worker', 'analytics'),
      createEdge('notifications-analytics', 'notifications', 'analytics'),
    ],
  },
];
