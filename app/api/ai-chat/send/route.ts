import { NextRequest, NextResponse } from 'next/server';
import {
  ensureLiveblocksFeed,
  getLiveblocksClient,
} from '@/lib/liveblocks';
import { AIChatMessagePayload } from '@/types/tasks';

const AI_USER_ID = 'ghost-ai';
const AI_USER_NAME = 'Ghost AI';
const feedId = 'ai-chat';

export async function POST(req: NextRequest) {
  try {
    const {
      roomId,
      content,
      senderId,
      senderName,
      role = 'user',
    } = await req.json();

    if (!roomId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: roomId, content' },
        { status: 400 },
      );
    }

    let message: AIChatMessagePayload;

    if (role === 'ai') {
      message = {
        type: 'ai-chat',
        senderId: AI_USER_ID,
        senderName: AI_USER_NAME,
        role,
        content: content.trim(),
        timestamp: Date.now(),
      };
    } else {
      if (!senderId || !senderName) {
        return NextResponse.json(
          {
            error:
              'Missing required fields for user message: senderId, senderName',
          },
          { status: 400 },
        );
      }

      message = {
        type: 'ai-chat',
        senderId,
        senderName,
        role,
        content: content.trim(),
        timestamp: Date.now(),
      };
    }

    const lb = getLiveblocksClient();

    await ensureLiveblocksFeed(roomId, feedId);

    // Append message
    const createdMessage = await lb.createFeedMessage({
      roomId,
      feedId,
      data: message,
    });

    console.log('✅ LIVEBLOCKS MESSAGE CREATED:', {
      roomId,
      feedId: 'ai-chat',
      createdMessage,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending AI chat message:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
