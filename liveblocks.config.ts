declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    RoomEvent: {
      type: 'ai-status';
      message: string;
      status: 'start' | 'thinking' | 'complete' | 'error';
    };

    ThreadMetadata: {};
    RoomInfo: {};
  }
}

export {};
