'use client';

import { useState } from 'react';

import { Bot, Sparkles } from 'lucide-react';

import { ProjectSidebar } from '@/components/editor/project-sidebar';
import { ShareDialog } from '@/components/editor/share-dialog';
import { ProjectDialogs } from '@/components/editor/ProjectDialogs';
import { EditorNavbar } from '@/components/editor/editor-navbar';

import {
  CANVAS_TEMPLATES,
  type CanvasTemplate,
} from '@/components/editor/starter-templates';
import { StarterTemplatesModal } from '@/components/editor/starter-templates-modal';

import { CanvasWrapper } from '@/components/canvas/CanvasWrapper';
import { useProjectActions, type Project } from '@/hooks/useProjectActions';

interface WorkspaceClientProps {
  projectName: string;
  roomId: string;
  projects: Project[];
  activeProjectId: string;
  isOwner: boolean;
}

export function WorkspaceClient({
  projectName,
  roomId,
  projects,
  activeProjectId,
  isOwner,
}: WorkspaceClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [templateToImport, setTemplateToImport] =
    useState<CanvasTemplate | null>(null);

  const actions = useProjectActions();

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-background'>
      {/* Top navbar */}
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        projectName={projectName}
        onShare={() => setIsShareDialogOpen(true)}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        toggleAiSidebar={() => setIsAiSidebarOpen((prev) => !prev)}
      />

      {/* Workspace */}
      <div className='relative flex flex-1 gap-2 overflow-hidden bg-background p-2'>
        {/* Left project sidebar */}
        {isSidebarOpen && (
          <div className='absolute inset-y-2 left-2 z-40 w-64'>
            <ProjectSidebar
              isOpen={true}
              onClose={() => setIsSidebarOpen(false)}
              projects={projects}
              onCreate={actions.openCreate}
              onRename={actions.openRename}
              onDelete={actions.openDelete}
              activeProjectId={activeProjectId}
            />
          </div>
        )}

        {/* Canvas */}
        <main className='relative z-0 flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-subtle bg-base'>
          <CanvasWrapper
            roomId={roomId}
            templateToImport={templateToImport}
            onTemplateImported={() => setTemplateToImport(null)}
          />
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
      <ShareDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        projectId={activeProjectId}
        isOwner={isOwner}
      />

      <StarterTemplatesModal
        open={isTemplatesModalOpen}
        onOpenChange={setIsTemplatesModalOpen}
        templates={CANVAS_TEMPLATES}
        onImport={(template) => {
          setTemplateToImport(template);
          setIsTemplatesModalOpen(false);
        }}
      />

      <ProjectDialogs
        openDialog={actions.openDialog}
        selectedProject={actions.selectedProject}
        loading={actions.loading}
        projectName={actions.projectName}
        updateProjectName={actions.updateProjectName}
        roomId={actions.roomId}
        closeDialog={actions.closeDialog}
        createProject={actions.createProject}
        renameProject={actions.renameProject}
        deleteProject={actions.deleteProject}
      />
    </div>
  );
}
