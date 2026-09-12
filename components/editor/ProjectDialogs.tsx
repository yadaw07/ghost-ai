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

type ProjectDialogsProps = {
  openDialog: 'create' | 'rename' | 'delete' | null;
  selectedProject: {
    id: string;
    name: string;
    slug: string;
    owned: boolean;
  } | null;
  loading: boolean;
  projectName: string;
  updateProjectName: (name: string) => void;
  roomId: string;
  closeDialog: () => void;
  createProject: () => Promise<void>;
  renameProject: () => Promise<void>;
  deleteProject: () => Promise<void>;
};

export function ProjectDialogs({
  openDialog,
  selectedProject,
  loading,
  projectName,
  updateProjectName,
  roomId,
  closeDialog,
  createProject,
  renameProject,
  deleteProject,
}: ProjectDialogsProps) {
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
              value={projectName}
              onChange={(e) => updateProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && projectName.trim()) {
                  e.preventDefault();
                  createProject();
                }
              }}
            />

            {roomId && (
              <p className='text-sm text-muted-foreground'>
                Room ID: <span className='font-medium'>{roomId}</span>
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant='default'
              disabled={loading || !projectName.trim()}
              onClick={createProject}
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
              value={projectName}
              onChange={(e) => updateProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && projectName.trim()) {
                  e.preventDefault();
                  renameProject();
                }
              }}
            />

            {projectName && (
              <p className='text-sm text-muted-foreground'>
                Room ID: <span className='font-medium'>{roomId}</span>
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant='default'
              disabled={loading || !projectName.trim()}
              onClick={renameProject}
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
              onClick={deleteProject}
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
