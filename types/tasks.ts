import { z } from 'zod';

export interface AIStatus {
  type: 'ai-status';
  status: 'started' | 'processing' | 'completed' | 'error';
  message: string;
}

export interface AIChatMessage {
  type: 'ai-chat';
  senderId: string;
  senderName: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export const AIStatusSchema = z.object({
  type: z.literal('ai-status'),
  status: z.enum(['started', 'processing', 'completed', 'error']),
  message: z.string(),
});

export const AIChatMessageSchema = z.object({
  type: z.literal('ai-chat'),
  senderId: z.string(),
  senderName: z.string(),
  role: z.enum(['user', 'ai']),
  content: z.string(),
  timestamp: z.number(),
});
