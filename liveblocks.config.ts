import type { CanvasNode, CanvasEdge } from './types/canvas';

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      isThinking: boolean;
    };

    Storage: {
      nodes: CanvasNode[];
      edges: CanvasEdge[];
    };

    UserMeta: {
      id: string;
      name: string;
      avatar: string;
      color: string;
    };

    RoomEvent: {};
    ThreadMetadata: {};
    RoomInfo: {};
  }
}

export {};
