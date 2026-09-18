'use client';

import { Check, Copy, MailPlus, Trash2, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useProjectShare } from '@/hooks/useProjectShare';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  isOwner: boolean;
}

export function ShareDialog({
  open,
  onOpenChange,
  projectId,
  isOwner,
}: ShareDialogProps) {
  const {
    collaborators,
    owner,
    email,
    setEmail,
    isLoading,
    isInviting,
    removingId,
    copied,
    error,
    inviteCollaborator,
    removeCollaborator,
    copyProjectLink,
  } = useProjectShare({ open, projectId });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[calc(100%-2rem)] max-w-140! rounded-3xl bg-elevated p-6'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-foreground'>
            <Users className='h-5 w-5 text-primary' />
            Share project
          </DialogTitle>
          <DialogDescription>
            {isOwner
              ? 'Invite people to collaborate on this workspace.'
              : 'People with access to this workspace.'}
          </DialogDescription>
        </DialogHeader>

        {/* Workspace link */}
        <div className='flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-subtle bg-base p-2.5'>
          <span className='min-w-0 truncate text-xs text-muted-foreground'>
            Share a direct link with teammates after you grant them access.
          </span>

          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-8 shrink-0 px-2.5 text-xs'
            onClick={copyProjectLink}
          >
            {copied ? (
              <Check className='h-3.5 w-3.5' />
            ) : (
              <Copy className='h-3.5 w-3.5' />
            )}
            {copied ? 'Copied!' : 'Copy link'}
          </Button>
        </div>

        {isOwner && (
          <div className='flex w-full gap-2'>
            <Input
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') inviteCollaborator();
              }}
              placeholder='name@example.com'
              className='bg-base text-foreground placeholder:text-muted-foreground'
              aria-label='Collaborator email address'
            />
            <Button
              type='button'
              onClick={inviteCollaborator}
              disabled={isInviting || !email.trim()}
            >
              <MailPlus className='h-4 w-4' />
              Invite
            </Button>
          </div>
        )}
        <div className='space-y-2'>
          <p className='text-xs font-medium uppercase tracking-[0.16em] text-text-muted'>
            People with access
          </p>
          {isLoading ? (
            <p className='text-sm text-muted-foreground'>
              Loading collaborators…
            </p>
          ) : collaborators.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No collaborators yet.
            </p>
          ) : (
            <ul className='max-h-64 space-y-1 overflow-y-auto'>
              {owner && (
                <li className='flex items-center gap-3 rounded-xl px-2 py-2'>
                  {owner.imageUrl ? (
                    <img
                      src={owner.imageUrl}
                      alt=''
                      className='h-8 w-8 rounded-full object-cover'
                    />
                  ) : (
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-subtle text-xs text-muted-foreground'>
                      {(owner.email ?? '?').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className='min-w-0 flex-1'>
                    {owner.displayName && (
                      <p className='truncate text-sm font-medium text-foreground'>
                        {owner.displayName}
                      </p>
                    )}
                    <p className='truncate text-xs text-muted-foreground'>
                      {owner.email ?? 'Owner'}
                    </p>
                  </div>
                  <span className='rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-primary'>
                    Owner
                  </span>
                </li>
              )}
              {collaborators.map((collaborator) => (
                <li
                  key={collaborator.id}
                  className='flex items-center gap-3 rounded-xl px-2 py-2'
                >
                  {collaborator.imageUrl ? (
                    <img
                      src={collaborator.imageUrl}
                      alt=''
                      className='h-8 w-8 rounded-full object-cover'
                    />
                  ) : (
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-subtle text-xs text-muted-foreground'>
                      {collaborator.email.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className='min-w-0 flex-1'>
                    {collaborator.displayName && (
                      <p className='truncate text-sm font-medium text-foreground'>
                        {collaborator.displayName}
                      </p>
                    )}
                    <p className='truncate text-xs text-muted-foreground'>
                      {collaborator.email}
                    </p>
                  </div>
                  {isOwner && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-sm'
                      onClick={() => removeCollaborator(collaborator.id)}
                      disabled={removingId === collaborator.id}
                      aria-label={`Remove ${collaborator.email}`}
                    >
                      <Trash2 className='h-4 w-4 text-destructive' />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <p className='text-sm text-destructive'>{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
