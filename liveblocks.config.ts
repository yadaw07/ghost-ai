import type { LiveMap, LiveObject } from '@liveblocks/client';
import type { LiveblocksNode, LiveblocksEdge } from '@liveblocks/react-flow';

import type { CanvasNode, CanvasEdge } from './types/canvas';

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      isThinking: boolean;
    };

    // Storage: {
    //   nodes: CanvasNode[];
    //   edges: CanvasEdge[];
    // };

    Storage: {
      flow: LiveObject<{
        nodes: LiveMap<string, LiveblocksNode<CanvasNode>>;
        edges: LiveMap<string, LiveblocksEdge<CanvasEdge>>;
      }>;
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
