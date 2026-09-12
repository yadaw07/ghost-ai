'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { EditorNavbar } from './editor-navbar';
import { ProjectSidebar } from './project-sidebar';
import { ProjectDialogs } from './ProjectDialogs';

import { Button } from '@/components/ui/button';
import { Project, useProjectActions } from '@/hooks/useProjectActions';

interface EditorProps {
  initialOwnedProjects: Project[];
  initialSharedProjects: Project[];
}

export function Editor({
  initialOwnedProjects,
  initialSharedProjects,
}: EditorProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const actions = useProjectActions();

  const projects = [...initialOwnedProjects, ...initialSharedProjects];

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-background'>
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Workspace area */}
      <div className='flex min-h-0 flex-1'>
        {/* Left sidebar */}
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          projects={projects}
          onCreate={actions.openCreate}
          onRename={actions.openRename}
          onDelete={actions.openDelete}
        />

        {/* Main content */}
        <main className='flex min-w-0 flex-1 items-center justify-center'>
          <div className='flex flex-col items-center space-y-4 text-center'>
            <h1 className='text-2xl font-heading text-foreground'>
              Create a project or open an existing one
            </h1>

            <p className='text-sm text-muted-foreground'>
              Start a new architecture workspace, or choose a project from the
              sidebar.
            </p>

            <Button variant='default' onClick={actions.openCreate}>
              <Plus className='mr-1 h-5 w-5' />
              New Project
            </Button>
          </div>
        </main>
      </div>

      {/* Dialogs */}
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

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 z-30 bg-black/10 md:hidden'
          onClick={closeSidebar}
          aria-hidden='true'
        />
      )}
    </div>
  );
}
