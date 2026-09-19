import { useEffect, useState } from 'react';

interface Collaborator {
  id: string;
  email: string;
  displayName: string | null;
  imageUrl: string | null;
}

interface ProjectOwner {
  id: string;
  email: string | null;
  displayName: string | null;
  imageUrl: string | null;
}

interface UseProjectShareProps {
  open: boolean;
  projectId: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function useProjectShare({ open, projectId }: UseProjectShareProps) {
  const [owner, setOwner] = useState<ProjectOwner | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    fetch(`/api/projects/${projectId}/collaborators`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to load collaborators.');
        }

        return response.json() as Promise<{
          owner: ProjectOwner;
          collaborators: Collaborator[];
        }>;
      })
      .then((data) => {
        if (isCurrent) {
          setOwner(data.owner);
          setCollaborators(data.collaborators);
        }
      })
      .catch((loadError: unknown) => {
        if (isCurrent)
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load collaborators.',
          );
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [open, projectId]);

  const inviteCollaborator = async () => {
    const inviteEmail = email.trim();
    if (!inviteEmail) {
      setError('Email is required.');
      return;
    }

    if (!isValidEmail(inviteEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsInviting(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        collaborator?: Collaborator;
        error?: string;
      };

      if (!response.ok || !data.collaborator)
        throw new Error(data.error ?? 'Unable to invite collaborator.');

      setCollaborators((current) => {
        const withoutExisting = current.filter(
          (collaborator) => collaborator.id !== data.collaborator!.id,
        );

        return [...withoutExisting, data.collaborator!];
      });
      setEmail('');
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : 'Unable to invite collaborator.',
      );
    } finally {
      setIsInviting(false);
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    setRemovingId(collaboratorId);
    setError(null);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborators/${collaboratorId}`,
        { method: 'DELETE' },
      );
      if (!response.ok) throw new Error('Unable to remove collaborator.');

      setCollaborators((current) =>
        current.filter((collaborator) => collaborator.id !== collaboratorId),
      );
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : 'Unable to remove collaborator.',
      );
    } finally {
      setRemovingId(null);
    }
  };

  const copyProjectLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return {
    owner,
    collaborators,
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
  };
}
