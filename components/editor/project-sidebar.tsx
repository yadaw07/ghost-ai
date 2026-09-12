'use client';

import { X, Plus, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { Project } from '@/hooks/useProjectActions';

interface ProjectSidebarProps {
  /** Controls whether the sidebar is visible */
  isOpen: boolean;
  /** Called when the user clicks the close button */
  onClose: () => void;
  /** Projects available to the current user */
  projects: Project[];
  /** Trigger opening the "Create Project" dialog */
  onCreate: () => void;
  /** Trigger opening the "Rename Project" dialog for a given project */
  onRename: (project: Project) => void;
  /** Trigger opening the "Delete Project" dialog for a given project */
  onDelete: (project: Project) => void;
  /** ID of the currently active project (for highlighting) */
  activeProjectId?: string;
}

/** Floating project list panel that slides in from the left */
export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  onCreate,
  onRename,
  onDelete,
  activeProjectId,
}: ProjectSidebarProps) {
  return (
    <aside
      className={`flex h-full w-64 shrink-0 flex-col overflow-hidden border-r border-subtle bg-surface transition-all duration-200 ${
        isOpen ? 'translate-x-0 opacity-100' : '-ml-64 translate-x-0 opacity-0'
      }`}
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
                      className={`group flex items-center justify-between rounded-xl border px-2 py-2 transition-colors ${
                        project.id === activeProjectId
                          ? 'border-primary/30 bg-primary/10'
                          : 'border-transparent hover:bg-subtle'
                      }`}
                    >
                      <Link
                        href={`/editor/${project.id}`}
                        className='flex min-w-0 flex-1 items-center gap-2'
                      >
                        {/* Active project indicator */}
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            project.id === activeProjectId
                              ? 'bg-primary'
                              : 'bg-muted-foreground/40'
                          }`}
                        />

                        <span className='truncate text-sm text-foreground'>
                          {project.name}
                        </span>
                      </Link>

                      <div className='flex gap-1'>
                        <Button
                          variant='ghost'
                          size='icon-sm'
                          className='opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100'
                          onClick={() => onRename(project)}
                        >
                          <Pencil className='h-4 w-4' />
                          <span className='sr-only'>Rename</span>
                        </Button>

                        <Button
                          variant='ghost'
                          size='icon-sm'
                          className='opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100'
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
                      className={`group flex items-center justify-between rounded-xl border px-2 py-2 transition-colors ${
                        project.id === activeProjectId
                          ? 'border-primary/30 bg-primary/10'
                          : 'border-transparent hover:bg-subtle'
                      }`}
                    >
                      <Link
                        href={`/editor/${project.id}`}
                        className='flex min-w-0 flex-1 items-center gap-2'
                      >
                        {/* Active project indicator */}
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            project.id === activeProjectId
                              ? 'bg-primary'
                              : 'bg-muted-foreground/40'
                          }`}
                        />

                        <span className='truncate text-sm text-foreground'>
                          {project.name}
                        </span>
                      </Link>
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
