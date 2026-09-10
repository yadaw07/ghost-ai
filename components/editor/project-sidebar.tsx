'use client';

import { X, Plus, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Project } from '@/hooks/useProjectDialogs';

interface ProjectSidebarProps {
  /** Controls whether the sidebar is visible */
  isOpen: boolean;
  /** Called when the user clicks the close button */
  onClose: () => void;
  /** List of mock projects */
  projects: Project[];
  /** Trigger opening the "Create Project" dialog */
  onCreate: () => void;
  /** Trigger opening the "Rename Project" dialog for a given project */
  onRename: (project: Project) => void;
  /** Trigger opening the "Delete Project" dialog for a given project */
  onDelete: (project: Project) => void;
}

/** Floating project list panel that slides in from the left */
export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  onCreate,
  onRename,
  onDelete,
}: ProjectSidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-surface border-r border-subtle transition-transform duration-200`}
    >
      {/* Header with title and close button */}
      <header className='flex items-center justify-between border-b border-subtle p-4'>
        <h2 className='text-sm font-medium text-foreground'>Projects</h2>
        <Button variant='ghost' size='icon-sm' onClick={onClose}>
          <X className='h-5 w-5' />
          <span className='sr-only'>Close projects</span>
        </Button>
      </header>

      {/* Main content – tabbed lists */}
      <div className='flex flex-1 flex-col overflow-y-auto p-4'>
        <Tabs defaultValue='my'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='my'>My Projects</TabsTrigger>
            <TabsTrigger value='shared'>Shared</TabsTrigger>
          </TabsList>

          <TabsContent value='my'>
            {projects.filter((p) => p.owned).length === 0 ? (
              <p className='text-muted-foreground mt-3'>No projects yet.</p>
            ) : (
              <ul className='space-y-3 mt-3'>
                {projects
                  .filter((p) => p.owned)
                  .map((project) => (
                    <li
                      key={project.id}
                      className='flex items-center justify-between'
                    >
                      <div className='flex flex-col'>
                        <span className='text-foreground'>{project.name}</span>
                      </div>
                      <div className='flex gap-1'>
                        <Button
                          variant='ghost'
                          size='icon-sm'
                          onClick={() => onRename(project)}
                        >
                          <Pencil className='h-4 w-4' />
                          <span className='sr-only'>Rename</span>
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon-sm'
                          onClick={() => onDelete(project)}
                        >
                          <Trash className='h-4 w-4' />
                          <span className='sr-only'>Delete</span>
                        </Button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value='shared'>
            {projects.filter((p) => !p.owned).length === 0 ? (
              <p className='text-muted-foreground mt-3'>No shared projects.</p>
            ) : (
              <ul className='space-y-3 mt-3'>
                {projects
                  .filter((p) => !p.owned)
                  .map((project) => (
                    <li
                      key={project.id}
                      className='flex items-center justify-between'
                    >
                      <div className='flex flex-col'>
                        <span className='text-foreground'>{project.name}</span>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer with New Project button */}
      <div className='p-4'>
        <Button
          variant='default'
          className='w-full justify-start'
          size='default'
          onClick={onCreate}
        >
          <Plus className='mr-2 h-5 w-5' />
          New Project
        </Button>
      </div>
    </aside>
  );
}
