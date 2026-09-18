'use client';

import { UserButton } from '@clerk/nextjs';

import {
  PanelLeftOpen,
  PanelLeftClose,
  Bot,
  Share2,
  Workflow,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface EditorNavbarProps {
  /** Whether the sidebar is currently open */
  isSidebarOpen: boolean;
  /** Callback to toggle the sidebar state */
  toggleSidebar: () => void;
  /** Name of the active project, shown next to the sidebar toggle */
  projectName: string;
  /** Opens the share dialog */
  onShare: () => void;
  /** Opens the starter templates modal */
  onOpenTemplates: () => void;
  /** Toggles the AI sidebar */
  toggleAiSidebar: () => void;
}

/** Top navigation bar for the editor view */
export function EditorNavbar({
  isSidebarOpen,
  toggleSidebar,
  projectName,
  onShare,
  onOpenTemplates,
  toggleAiSidebar,
}: EditorNavbarProps) {
  return (
    <header className='z-50 flex h-12 shrink-0 items-center justify-between border-b border-subtle bg-base px-4'>
      {/* Left side */}
      <div className='flex min-w-0 items-center gap-3'>
        <button
          type='button'
          onClick={toggleSidebar}
          className='flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-subtle hover:text-foreground'
          aria-label={isSidebarOpen ? 'Close projects' : 'Open projects'}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className='h-4 w-4' />
          ) : (
            <PanelLeftOpen className='h-4 w-4' />
          )}
        </button>

        <div className='min-w-0'>
          <h1 className='truncate text-sm font-medium text-foreground'>
            {projectName}
          </h1>

          <p className='text-[10px] leading-none text-muted-foreground'>
            Workspace
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          className='hidden sm:flex'
          onClick={onShare}
        >
          <Share2 className='mr-1.5 h-3.5 w-3.5' />
          Share
        </Button>

        <Button variant='ghost' size='sm' onClick={onOpenTemplates}>
          <Workflow className='mr-1.5 h-3.5 w-3.5' />
          Templates
        </Button>

        <Button
          variant='default'
          size='sm'
          onClick={toggleAiSidebar}
          className='h-8'
        >
          <Bot className='mr-1.5 h-4 w-4' />
          AI
        </Button>

        <UserButton />
      </div>
    </header>
  );
}
