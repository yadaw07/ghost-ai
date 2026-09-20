'use client';

import { useState, useEffect } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useCanvasAutosave(
  projectId: string,
  nodes: any[],
  edges: any[],
) {
  const [status, setStatus] = useState<SaveStatus>('idle');

  useEffect(() => {
    if (!projectId) return;

    const timer = setTimeout(async () => {
      setStatus('saving');

      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodes, edges }),
        });

        if (!response.ok) {
          throw new Error('Save failed');
        }

        setStatus('saved');

        // Reset to idle after a few seconds
        setTimeout(() => setStatus('idle'), 2000);
      } catch (error) {
        console.error('Autosave error:', error);
        setStatus('error');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [projectId, JSON.stringify(nodes), JSON.stringify(edges)]);

  return { status };
}
