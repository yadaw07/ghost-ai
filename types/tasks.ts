export interface AIStatusPayload {
  type: 'ai-status';
  status: 'started' | 'processing' | 'completed' | 'error';
  message: string;
}
