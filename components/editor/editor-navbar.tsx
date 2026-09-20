'use client';

import { UserButton } from '@clerk/nextjs';

import {
  PanelLeftOpen,
  PanelLeftClose,
  Bot,
  Share2,
  Workflow,
  Check,
  Loader2,
  AlertCircle,
  Save,
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
  /** Current save status of the canvas */
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}

/** Top navigation bar for the editor view */
export function EditorNavbar({
  isSidebarOpen,
  toggleSidebar,
  projectName,
  onShare,
  onOpenTemplates,
  toggleAiSidebar,
  saveStatus,
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

        <div className='min-w-0 relative group'>
          <h1 className='truncate text-sm font-medium text-foreground'>
            {projectName}
          </h1>

          <div className='flex items-center gap-1.5'>
            <p className='text-[10px] leading-none text-muted-foreground'>
              Workspace
            </p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className='flex items-center gap-1.5'>
        {saveStatus === 'idle' || !saveStatus ? (
          <div className='flex h-8 items-center gap-1.5 rounded-md border border-border-subtle bg-subtle px-2.5'>
            <Save className='h-3.5 w-3.5 text-muted-foreground' />
            <span className='hidden text-[11px] text-muted-foreground sm:inline'>
              Save
            </span>
          </div>
        ) : (
          <div
            className='flex h-8 items-center gap-1.5 rounded-md border border-border-subtle bg-subtle px-2.5'
            aria-live='polite'
          >
            {saveStatus === 'saving' && (
              <>
                <Loader2 className='h-3.5 w-3.5 animate-spin text-muted-foreground' />
                <span className='hidden text-[11px] text-muted-foreground sm:inline'>
                  Saving...
                </span>
              </>
            )}

            {saveStatus === 'saved' && (
              <>
                <Check className='h-3.5 w-3.5 text-success' />
                <span className='hidden text-[11px] text-success sm:inline'>
                  Saved
                </span>
              </>
            )}

            {saveStatus === 'error' && (
              <>
                <AlertCircle className='h-3.5 w-3.5 text-error' />
                <span className='hidden text-[11px] text-error sm:inline'>
                  Save failed
                </span>
              </>
            )}
          </div>
        )}

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
