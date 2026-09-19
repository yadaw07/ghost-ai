'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, FileText, Download } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

import { cn } from '@/lib/utils';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISidebar({ isOpen, onClose }: AISidebarProps) {
  const [inputValue, setInputValue] = useState('');
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
      // Submit logic will go here
      console.log('Submit:', inputValue);
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
          <TabsList className='grid w-full grid-cols-2 bg-base p-1'>
            <TabsTrigger
              value='architect'
              className='text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-muted-foreground'
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value='specs'
              className='text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-muted-foreground'
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
            {/* Empty State */}
            <div className='flex h-full flex-col items-center justify-center text-center py-10'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-primary/10'>
                <Bot className='h-6 w-6 text-accent-primary' />
              </div>
              <h3 className='mb-2 text-sm font-medium text-foreground'>
                Start Architecting
              </h3>
              <p className='mb-6 text-xs text-muted-foreground max-w-50'>
                Describe your system and let Ghost AI help you map it out.
              </p>

              <div className='flex flex-col gap-2 w-full'>
                {[
                  'Design an e-commerce backend',
                  'Create a chat app architecture',
                  'Build a CI/CD pipeline',
                ].map((chip) => (
                  <button
                    key={chip}
                    className='text-left px-3 py-2 text-xs rounded-xl bg-subtle text-accent-ai-text border border-transparent hover:border-accent-ai-text/30 transition-colors'
                    onClick={() => setInputValue(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className='mt-4 flex items-end gap-2 rounded-2xl bg-base p-2 border border-border-subtle'>
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Ask AI Architect...'
              className='min-h-18 max-h-40 resize-none border-0 bg-transparent p-2 focus-visible:ring-0 text-xs'
            />
            <Button
              size='icon'
              className='h-10 w-10 shrink-0 rounded-xl bg-accent-primary text-background hover:bg-accent-primary/90'
              disabled={!inputValue.trim()}
            >
              <Send className='h-4 w-4' />
            </Button>
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
