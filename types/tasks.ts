import { z } from 'zod';

export interface AIStatusPayload {
  type: 'ai-status';
  status: 'started' | 'processing' | 'completed' | 'error';
  message: string;
}

export interface AIChatMessagePayload {
  [key: string]: string | number;

  type: 'ai-chat';
  senderId: string;
  senderName: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export const AIChatMessageSchema = z.object({
  type: z.literal('ai-chat'),
  senderId: z.string(),
  senderName: z.string(),
  role: z.enum(['user', 'ai']),
  content: z.string(),
  timestamp: z.number(),
});
