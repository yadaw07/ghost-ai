'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, FileText, Download } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: number;
  text: string;
}

export function AISidebar({ isOpen, onClose }: AISidebarProps) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(Math.max(textareaRef.current.scrollHeight, 72), 160)}px`;
    }
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      const text = inputValue.trim();
      if (!text) return;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text,
        },
      ]);

      setInputValue('');
    }
  };

  if (!isOpen) return null;

  return (
    <aside className='flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface/95 shadow-xl'>
      {/* Header */}
      <header className='flex h-16 shrink-0 items-center justify-between border-b border-border-subtle px-4'>
        <div className='flex items-center gap-2'>
          <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-accent-primary/10'>
            <Bot className='h-4 w-4 text-accent-primary' />
          </div>
          <div>
            <h2 className='text-sm font-medium text-foreground'>
              AI Workspace
            </h2>
            <p className='text-[10px] text-muted-foreground'>
              Collaborate with Ghost AI
            </p>
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
        defaultValue='architect'
        className='flex flex-1 flex-col overflow-hidden'
      >
        <div className='px-4 pt-4'>
          <TabsList className='flex h-8 w-fit rounded-full bg-base p-0.5'>
            <TabsTrigger
              value='architect'
              className='rounded-full px-3 text-[11px] text-muted-foreground transition-colors
      data-[state=active]:bg-accent-ai-text
      data-[state=active]:text-white
      data-[state=active]:shadow-sm'
            >
              AI Architect
            </TabsTrigger>

            <TabsTrigger
              value='specs'
              className='rounded-full px-3 text-[11px] text-muted-foreground transition-colors
      data-[state=active]:bg-transparent
      data-[state=active]:text-foreground'
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value='architect'
          className='flex flex-1 flex-col overflow-hidden p-4 pt-4'
        >
          <ScrollArea className='flex-1 pr-3'>
            <div className='flex min-h-full flex-col gap-3 py-4'>
              {messages.length === 0 ? (
                <div className='flex flex-1 flex-col items-center justify-center py-10 text-center'>
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
                messages.map((message) => (
                  <div key={message.id} className='flex justify-end'>
                    <div className='max-w-[85%] rounded-2xl border border-accent-primary/30 bg-accent-primary/5 px-3 py-2 text-xs text-foreground'>
                      {message.text}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className='mt-4 border-t border-border-subtle/60 pt-3'>
            <div className='flex items-end gap-2 rounded-2xl bg-base p-2'>
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Ask AI Architect...'
                className='min-h-18 max-h-40 resize-none border-0 bg-transparent p-2 text-xs focus-visible:ring-0'
              />

              <Button
                size='icon'
                className='h-10 w-10 shrink-0 rounded-xl bg-accent-primary text-background hover:bg-accent-primary/90'
                disabled={!inputValue.trim()}
              >
                <Send className='h-4 w-4' />
              </Button>
            </div>
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
  );
}
