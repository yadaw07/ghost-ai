'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';

import {
  PanelLeftOpen,
  PanelLeftClose,
  Bot,
  Share2,
  Sparkles,
  Compass,
} from 'lucide-react';

import { ProjectSidebar } from '@/components/editor/project-sidebar';
import { Button } from '@/components/ui/button';
import type { Project } from '@/hooks/useProjectActions';

interface WorkspaceClientProps {
  projectName: string;
  roomId: string;
  projects: Project[];
  activeProjectId: string;
}

export function WorkspaceClient({
  projectName,
  roomId,
  projects,
  activeProjectId,
}: WorkspaceClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-background'>
      {/* Top navbar */}
      <header className='z-50 flex h-12 shrink-0 items-center justify-between border-b border-subtle bg-base px-4'>
        {/* Left side */}
        <div className='flex min-w-0 items-center gap-3'>
          <button
            type='button'
            onClick={() => setIsSidebarOpen((prev) => !prev)}
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
          <Button variant='ghost' size='sm' className='hidden sm:flex' disabled>
            <Share2 className='mr-1.5 h-3.5 w-3.5' />
            Share
          </Button>

          <Button
            variant='default'
            size='sm'
            onClick={() => setIsAiSidebarOpen((prev) => !prev)}
            className='h-8'
          >
            <Bot className='mr-1.5 h-4 w-4' />
            AI
          </Button>

          <UserButton />
        </div>
      </header>

      {/* Workspace */}
      <div className='relative flex flex-1 gap-2 overflow-hidden bg-background p-2'>
        {/* Left project sidebar */}
        {isSidebarOpen && (
          <div className='relative z-40 h-full w-64 shrink-0'>
            <ProjectSidebar
              isOpen={true}
              onClose={() => setIsSidebarOpen(false)}
              projects={projects}
              onCreate={() => {}}
              onRename={() => {}}
              onDelete={() => {}}
              activeProjectId={activeProjectId}
            />
          </div>
        )}

        {/* Canvas */}
        <main
          className='relative flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-subtle bg-base'
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        >
          {/* Canvas placeholder */}
          <div className='flex max-w-lg flex-col items-center px-6 text-center'>
            <div className='mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-subtle bg-surface shadow-lg'>
              <Compass className='h-7 w-7 text-primary' />
            </div>

            <p className='mb-2 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground'>
              Workspace shell
            </p>

            <h2 className='text-2xl font-medium tracking-tight text-foreground'>
              Canvas and collaboration tooling land here next.
            </h2>

            <p className='mt-4 max-w-md text-sm leading-6 text-muted-foreground'>
              This room is ready for the shared architecture canvas, durable AI
              workflows, and real-time presence. For now, the shell is wired
              with project context and navigation only.
            </p>
          </div>
        </main>

        {/* AI sidebar */}
        {isAiSidebarOpen && (
          <aside className='hidden h-full w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-subtle bg-surface lg:flex'>
            {/* AI header */}
            <header className='flex h-16 items-center justify-between border-b border-subtle px-4'>
              <div>
                <h2 className='text-sm font-medium text-foreground'>
                  AI Copilot
                </h2>

                <p className='text-xs text-muted-foreground'>
                  Placeholder panel
                </p>
              </div>

              <Sparkles className='h-4 w-4 text-primary' />
            </header>

            {/* AI content */}
            <div className='flex flex-1 flex-col justify-between p-4'>
              <div className='rounded-2xl border border-subtle bg-base p-4'>
                <div className='mb-3 flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10'>
                    <Bot className='h-4 w-4 text-primary' />
                  </div>

                  <div>
                    <p className='text-sm font-medium text-foreground'>
                      Chat surface pending
                    </p>

                    <p className='text-xs text-muted-foreground'>Placeholder</p>
                  </div>
                </div>

                <p className='text-xs leading-5 text-muted-foreground'>
                  The toggle is wired. Messaging and generation are
                  intentionally out of scope for this feature.
                </p>
              </div>

              <div className='rounded-2xl border border-subtle bg-base p-4'>
                <p className='mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground'>
                  Future hooks
                </p>

                <p className='text-xs leading-5 text-muted-foreground'>
                  Prompt composer, run status, and architecture guidance will
                  attach to this sidebar later.
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
