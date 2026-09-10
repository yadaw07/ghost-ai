'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { EditorNavbar } from './editor-navbar';
import { ProjectSidebar } from './project-sidebar';
import { ProjectDialogs } from './ProjectDialogs';

import { Button } from '@/components/ui/button';
import { useProjectDialogs, Project } from '@/hooks/useProjectDialogs';

export function Editor() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Mock initial projects (one owned, one shared)
  const initialProjects: Project[] = [
    { id: '1', name: 'Demo Project', slug: 'demo-project', owned: true },
    {
      id: '2',
      name: 'Demo Project the second',
      slug: 'demo-project-2',
      owned: true,
    },
    {
      id: '3',
      name: 'my Shared Project',
      slug: 'my-shared-project',
      owned: false,
    },
  ];

  const dialogs = useProjectDialogs(initialProjects);

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        projects={dialogs.projects}
        onCreate={dialogs.openCreate}
        onRename={dialogs.openRename}
        onDelete={dialogs.openDelete}
      />

      {/* Dialogs for create/rename/delete */}
      <ProjectDialogs
        {...dialogs}
        onProjectCreated={() => setIsSidebarOpen(true)}
      />

      {/* Backdrop scrim for mobile – closes sidebar when clicking outside */}
      {isSidebarOpen && !dialogs.openDialog && (
        <div
          className='fixed inset-y-0 left-64 right-0 z-30 bg-black/10 md:hidden'
          onClick={closeSidebar}
        />
      )}

      <main className='flex flex-1 items-center justify-center'>
        <div className='flex flex-col items-center space-y-4 text-center'>
          <h1 className='text-2xl font-heading text-foreground'>
            Create a project or open an existing one
          </h1>
          <p className='text-sm text-muted-foreground'>
            Start a new architecture workspace, or choose a project from the
            sidebar.
          </p>
          <Button variant='default' onClick={dialogs.openCreate}>
            <Plus className='mr-1 h-5 w-5' />
            New Project
          </Button>
        </div>
      </main>
    </div>
  );
}
