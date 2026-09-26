'use client';

import { useUser } from '@clerk/nextjs';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, FileText, Download, Loader2 } from 'lucide-react';

import { useFeedMessages } from '@liveblocks/react/suspense';

import { useRealtimeRun } from '@trigger.dev/react-hooks';

import { cn } from '@/lib/utils';
import { AIStatusPayload } from '@/types/tasks';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AISidebarProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface RealtimeRunWatcherProps {
  runId: string;
  accessToken: string;
  onStatusChange: (status: string, output: unknown) => void;
}

const TERMINAL_STATUSES = [
  'COMPLETED',
  'FAILED',
  'CANCELED',
  'CRASHED',
  'TIMED_OUT',
  'INTERRUPTED',
  'SYSTEM_ERROR',
  'INVALID_PAYLOAD',
  'EXPIRED',
  'ABORTED',
] as const;

function RealtimeRunWatcher({
  runId,
  accessToken,
  onStatusChange,
}: RealtimeRunWatcherProps) {
  const { run } = useRealtimeRun(runId, {
    accessToken,
  });

  const handledRef = useRef(false);

  useEffect(() => {
    if (!run) return;

    if (handledRef.current) return;

    if (!(TERMINAL_STATUSES as readonly string[]).includes(run.status)) {
      return;
    }

    handledRef.current = true;

    onStatusChange(run.status, run.output);
  }, [run?.status, run?.output, onStatusChange]);

  return null;
}

const tabTrigger =
  'rounded-full px-3 text-[11px] font-medium text-muted-foreground transition-colors';

const tabTriggerActive =
  'bg-accent-ai-text! text-white! border-transparent! shadow-sm';

interface AIChatMessage {
  type: 'ai-chat';
  senderId: string;
  senderName: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export function AISidebar({ roomId, isOpen, onClose }: AISidebarProps) {
  const { user } = useUser();

  const [inputValue, setInputValue] = useState('');
  const [tab, setTab] = useState('architect');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [runState, setRunState] = useState<{
    runId: string;
    token: string;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([]);
  const [aiStatus, setAiStatus] = useState<AIStatusPayload | null>(null);

  const aiStatusFeed = useFeedMessages('ai-status');
  console.log('AI STATUS FEED ', aiStatusFeed);

  // Sync Liveblocks feed messages to AI status and chat
  useEffect(() => {
    if (!aiStatusFeed || aiStatusFeed.messages.length === 0) return;

    const latestMessage = aiStatusFeed.messages[aiStatusFeed.messages.length - 1];
    const data = latestMessage.data as {
      type: 'ai-status';
      status: string;
      message: string;
    };

    if (data?.type === 'ai-status') {
      setAiStatus({
        type: 'ai-status',
        status: data.status as any,
        message: data.message,
      });

      if (data.status === 'completed' || data.status === 'error') {
        const aiMessage: AIChatMessage = {
          type: 'ai-chat',
          senderId: 'ghost-ai',
          senderName: 'Ghost AI',
          role: 'ai',
          content: data.message,
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, aiMessage]);
      }
    }
  }, [aiStatusFeed]);

  const isRunActive = !!runState;
  const isAiThinking =
    aiStatus?.status === 'started' || aiStatus?.status === 'processing';

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(Math.max(textareaRef.current.scrollHeight, 72), 160)}px`;
    }
  }, [inputValue]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();

    if (!text || isSending || isRunActive) return;

    setIsSending(true);
    setSendError(null);

    // 1. Add user's message directly to Liveblocks
    const userMessage: AIChatMessage = {
      type: 'ai-chat',
      senderId: user?.id ?? 'unknown',
      senderName: user?.fullName ?? user?.username ?? 'You',
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMessage]);

    // 2. Add initial AI status
    setAiStatus({
      type: 'ai-status',
      status: 'started',
      message: 'Ghost AI is analyzing your request…',
    });

    setInputValue('');

    try {
      // 3. Start the AI design run
      const response = await fetch('/api/ai/design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: text,
          roomId,
          projectId: roomId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit design prompt');
      }

      const { runId } = await response.json();

      // 4. Get public token for Trigger realtime updates
      const tokenResponse = await fetch('/api/ai/design/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ runId }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get realtime run token');
      }

      const { token } = await tokenResponse.json();

      // 5. Start watching the Trigger run
      setRunState({
        runId,
        token,
      });
    } catch (error) {
      console.error('Failed to submit prompt:', error);

      setSendError(
        error instanceof Error
          ? error.message
          : 'Failed to submit prompt. Please try again.',
      );

      // Show failure in chat

      const aiMessage: AIChatMessage = {
        type: 'ai-chat',
        senderId: 'ghost-ai',
        senderName: 'Ghost AI',
        role: 'ai',
        content:
          'I couldn’t complete the architecture generation. Please try again.',
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);

      // Error status
      setAiStatus({
        type: 'ai-status',
        status: 'error',
        message: 'Ghost AI encountered an error.',
      });

      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const activeRun = runState;

  return (
    <>
      {activeRun && (
        <RealtimeRunWatcher
          runId={activeRun.runId}
          accessToken={activeRun.token}
          onStatusChange={(status, _output) => {
            const isSuccess = status === 'COMPLETED';

            if (isSuccess) {
              const aiMessage: AIChatMessage = {
                type: 'ai-chat',
                senderId: 'ghost-ai',
                senderName: 'Ghost AI',
                role: 'ai',
                content: 'Architecture design complete.',
                timestamp: Date.now(),
              };

              setChatMessages((prev) => [...prev, aiMessage]);

              setAiStatus({
                type: 'ai-status',
                status: 'completed',
                message: 'Architecture design complete.',
              });
            } else {
              const aiMessage: AIChatMessage = {
                type: 'ai-chat',
                senderId: 'ghost-ai',
                senderName: 'Ghost AI',
                role: 'ai',
                content:
                  'I couldn’t complete the architecture generation. Please try again.',
                timestamp: Date.now(),
              };

              setChatMessages((prev) => [...prev, aiMessage]);

              setAiStatus({
                type: 'ai-status',
                status: 'error',
                message: 'Ghost AI encountered an error.',
              });
            }

            setRunState(null);
          }}
        />
      )}
      <aside className='flex h-full min-h-0 w-75 shrink-0 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface/95 shadow-xl'>
        {/* Header */}
        <header className='flex h-16 shrink-0 items-center justify-between border-b border-border-subtle px-4'>
          <div className='flex items-center gap-2'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-accent-primary/10'>
              <Bot className='h-4 w-4 text-accent-primary' />
            </div>
            <div className='flex flex-col'>
              <h2 className='text-sm font-medium text-foreground'>
                AI Workspace
              </h2>
              <div className='flex items-center gap-1.5'>
                <p className='text-[10px] text-muted-foreground'>
                  Collaborate with Ghost AI
                </p>
                {isAiThinking && (
                  <div className='flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20'>
                    <Loader2 className='h-2 w-2 animate-spin' />
                    <span className='text-[9px] font-medium leading-none'>
                      {aiStatus?.message ?? 'Thinking...'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground'
            onClick={onClose}
          >
            <X className='h-4 w-4' />
          </Button>
        </header>

        <Tabs
          value={tab}
          onValueChange={setTab}
          className='flex min-h-0 flex-1 flex-col overflow-hidden'
        >
          <div className='px-4 pt-4'>
            <TabsList className='flex h-8 w-fit rounded-full bg-base p-0.5'>
              <TabsTrigger
                value='architect'
                className={cn(
                  tabTrigger,
                  tab === 'architect' && tabTriggerActive,
                )}
              >
                AI Architect
              </TabsTrigger>

              <TabsTrigger
                value='specs'
                className={cn(tabTrigger, tab === 'specs' && tabTriggerActive)}
              >
                Specs
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value='architect'
            className='flex min-h-0 flex-1 flex-col overflow-hidden p-4 pt-4'
          >
            <ScrollArea className='min-h-0 flex-1 pr-3'>
              <div className='flex min-h-full flex-col gap-3 py-4'>
                {chatMessages.length === 0 ? (
                  <div className='flex flex-1 flex-col items-center justify-center py-6 text-center'>
                    <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-primary/10'>
                      <Bot className='h-6 w-6 text-accent-primary' />
                    </div>

                    <h3 className='mb-2 text-sm font-medium text-foreground'>
                      Start Architecting
                    </h3>

                    <p className='mb-6 max-w-50 text-xs text-muted-foreground'>
                      Describe your system and let Ghost AI help you map it out.
                    </p>

                    <div className='flex w-full flex-col gap-2'>
                      {[
                        'Design an e-commerce backend',
                        'Create a chat app architecture',
                        'Build a CI/CD pipeline',
                      ].map((chip) => (
                        <button
                          key={chip}
                          className='rounded-xl border border-transparent bg-subtle px-3 py-2 text-left text-xs text-accent-ai-text transition-colors hover:border-accent-ai-text/30'
                          onClick={() => setInputValue(chip)}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div
                      key={`${message.senderId}-${message.timestamp}-${index}`}
                      className={cn(
                        'flex flex-col',
                        message.role === 'user' ? 'items-end' : 'items-start',
                      )}
                    >
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='text-[10px] font-medium text-muted-foreground'>
                          {message.senderName}
                        </span>
                        <span className='text-[9px] text-muted-foreground/60'>
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {message.role === 'ai' && (
                        <div className='mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-primary/10'>
                          <Bot className='h-3.5 w-3.5 text-accent-primary' />
                        </div>
                      )}

                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl border px-3 py-2 text-xs',
                          message.role === 'user'
                            ? 'border-accent-primary/30 bg-[#62C073] text-white rounded-tr-none'
                            : 'border-border-subtle bg-base text-foreground rounded-tl-none',
                        )}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className='mt-4 shrink-0 border-t border-border-subtle/60 pt-3'>
              {isAiThinking && (
                <div className='mb-2 flex items-center justify-between rounded-lg bg-base border border-accent-primary/20 px-3 py-1.5 text-xs'>
                  <div className='flex items-center gap-2'>
                    <div className='h-1.5 w-1.5 rounded-full bg-[#62C073] animate-pulse' />
                    <span className='text-muted-foreground font-medium'>
                      {aiStatus?.message ?? 'Generating design...'}
                    </span>
                  </div>
                  <div className='h-3 w-3 border-2 border-accent-primary border-t-transparent rounded-full animate-spin' />
                </div>
              )}

              <div className='flex items-end gap-2 rounded-2xl bg-base p-2 relative'>
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isAiThinking ? 'AI is thinking...' : 'Ask AI Architect...'
                  }
                  className={cn(
                    'min-h-18 max-h-40 resize-none border-0 bg-transparent p-2 text-xs focus-visible:ring-0',
                    isAiThinking && 'opacity-50 cursor-not-allowed',
                  )}
                  disabled={isRunActive}
                />

                <Button
                  size='icon'
                  className={cn(
                    'h-10 w-10 shrink-0 rounded-xl bg-[#62C073] text-background hover:bg-[#62C073]/90',
                    (isAiThinking || isSending) &&
                      'opacity-50 cursor-not-allowed',
                  )}
                  disabled={isRunActive || isSending}
                  onClick={handleSendMessage}
                >
                  {isRunActive || isSending ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Send className='h-4 w-4' />
                  )}
                </Button>
              </div>

              {sendError && (
                <p className='absolute bottom-14 left-1/2 -translate-x-1/2 text-[10px] text-destructive font-medium'>
                  {sendError}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value='specs'
            className='flex flex-1 flex-col overflow-hidden p-4 pt-4'
          >
            <div className='mb-6'>
              <Button className='w-full rounded-xl bg-accent-primary text-background hover:bg-accent-primary/90 text-xs font-medium py-5'>
                Generate Spec
              </Button>
            </div>

            <div className='space-y-3'>
              <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1'>
                Recent Specs
              </p>
              <div className='group flex items-center justify-between rounded-2xl border border-border-subtle bg-elevated p-3 transition-colors hover:border-accent-primary/30'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface border border-border-subtle'>
                    <FileText className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <div className='overflow-hidden'>
                    <p className='text-xs font-medium text-foreground truncate'>
                      Backend_Architecture_v1
                    </p>
                    <p className='text-[10px] text-muted-foreground truncate'>
                      Detailed system design for...
                    </p>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  disabled
                  className='h-8 w-8 rounded-lg text-muted-foreground'
                >
                  <Download className='h-3 w-3' />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </aside>
    </>
  );
}
