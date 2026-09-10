'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Plus, Trash, Pencil } from 'lucide-react';
import { useProjectDialogs } from '@/hooks/useProjectDialogs';
import { useEffect, useState } from 'react';

type ProjectDialogsProps = ReturnType<typeof useProjectDialogs> & {
  onProjectCreated?: () => void;
};

/**
 * Renders the create / rename / delete project dialogs. This component is placed at the
 * top‑level of the editor page so the dialogs sit above the sidebar and main content.
 */
export function ProjectDialogs({
  openDialog,
  selectedProject,
  loading,
  closeDialog,
  createProject,
  renameProject,
  deleteProject,
  onProjectCreated,
}: ProjectDialogsProps) {
  // Local state for the name field within create / rename dialogs.
  const [name, setName] = useState('');

  // Sync name when opening rename dialog.
  useEffect(() => {
    if (openDialog === 'rename' && selectedProject) {
      setName(selectedProject.name);
    } else if (openDialog === 'create') {
      setName('');
    }
  }, [openDialog, selectedProject]);

  const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

  return (
    <>
      {/* Create Project Dialog */}
      <Dialog
        open={openDialog === 'create'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-primary'>Create Project</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-2'>
            <label
              className='text-sm font-medium'
              htmlFor='create-project-name'
            >
              Project name
            </label>
            <Input
              id='create-project-name'
              placeholder='My project'
              className='text-foreground placeholder:text-muted-foreground'
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  e.preventDefault();
                  createProject(name.trim());
                  onProjectCreated?.();
                }
              }}
            />
            {name && (
              <p className='text-sm text-muted-foreground'>
                Slug: <span className='font-medium'>{slug}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='default'
              disabled={loading || !name.trim()}
              onClick={() => {
                createProject(name);
                onProjectCreated?.();
              }}
            >
              <Plus className='mr-2 h-5 w-5' />
              Create
            </Button>

            <Button variant='outline' disabled={loading} onClick={closeDialog}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog
        open={openDialog === 'rename'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-primary'>Rename Project</DialogTitle>
            {selectedProject && (
              <DialogDescription>
                Current name:{' '}
                <span className='font-medium'>{selectedProject.name}</span>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className='flex flex-col gap-2'>
            <label
              className='text-sm font-medium'
              htmlFor='rename-project-name'
            >
              New name
            </label>
            <Input
              id='rename-project-name'
              autoFocus
              className='text-foreground placeholder:text-muted-foreground'
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  e.preventDefault();
                  renameProject(name.trim());
                }
              }}
            />
            {name && (
              <p className='text-sm text-muted-foreground'>
                Slug: <span className='font-medium'>{slug}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='default'
              disabled={loading || !name.trim()}
              onClick={() => renameProject(name.trim())}
            >
              <Pencil className='mr-2 h-4 w-4' />
              Rename
            </Button>

            <Button variant='outline' disabled={loading} onClick={closeDialog}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog
        open={openDialog === 'delete'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-primary'>Delete Project</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <DialogDescription>
              Are you sure you want to permanently delete the project{' '}
              <span className='font-medium'>{selectedProject.name}</span>? This
              action cannot be undone.
            </DialogDescription>
          )}
          <DialogFooter>
            <Button
              variant='destructive'
              disabled={loading}
              onClick={() => deleteProject()}
            >
              <Trash className='mr-2 h-4 w-4' />
              Delete
            </Button>
            <Button variant='outline' disabled={loading} onClick={closeDialog}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
