// import type { LiveMap, LiveObject } from '@liveblocks/client';
// import type { LiveblocksNode, LiveblocksEdge } from '@liveblocks/react-flow';

// import type { CanvasNode, TCanvasEdge } from './types/canvas';

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      isThinking: boolean;
    };

    // Storage: {
    //   flow: LiveObject<{
    //     nodes: LiveMap<string, LiveblocksNode<CanvasNode>>;
    //     edges: LiveMap<string, LiveblocksEdge<TCanvasEdge>>;
    //   }>;
    // };

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
