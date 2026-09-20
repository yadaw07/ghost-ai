'use client';

import { useState } from 'react';

import { ProjectSidebar } from '@/components/editor/project-sidebar';
import { ShareDialog } from '@/components/editor/share-dialog';
import { ProjectDialogs } from '@/components/editor/ProjectDialogs';
import { EditorNavbar } from '@/components/editor/editor-navbar';
import { AISidebar } from '@/components/editor/ai-sidebar';

import {
  CANVAS_TEMPLATES,
  type CanvasTemplate,
} from '@/components/editor/starter-templates';
import { StarterTemplatesModal } from '@/components/editor/starter-templates-modal';

import { CanvasWrapper } from '@/components/canvas/CanvasWrapper';
import { useProjectActions, type Project } from '@/hooks/useProjectActions';
import { useCanvasAutosave } from '@/hooks/useCanvasAutosave';

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

  // Autosave hook
  // We pass an empty array for nodes/edges here because the actual
  // data is managed by Liveblocks inside CollaborativeCanvas.
  // To properly trigger autosave, we need the current state.
  // Since we don't have access to Liveblocks state here,
  // we'll move the autosave hook inside CollaborativeCanvas.
  // However, the save status needs to be displayed in the Navbar.
  // We'll use a simple state and a callback.
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');


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
        saveStatus={saveStatus}
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
            activeProjectId={activeProjectId}
            onSaveStatusChange={setSaveStatus}
            templateToImport={templateToImport}
            onTemplateImported={() => setTemplateToImport(null)}
          />
        </main>

        {/* AI sidebar */}
        {isAiSidebarOpen && (
          <AISidebar
            isOpen={isAiSidebarOpen}
            onClose={() => setIsAiSidebarOpen(false)}
          />
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
