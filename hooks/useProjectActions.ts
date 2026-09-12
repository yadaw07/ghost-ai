'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface Project {
  id: string;
  name: string;
  slug: string;
  owned: boolean;
}

type DialogType = 'create' | 'rename' | 'delete' | null;

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function shortSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

export function useProjectActions() {
  const router = useRouter();

  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [roomId, setRoomId] = useState('');

  const [suffix, setSuffix] = useState('');

  const openCreate = () => {
    setProjectName('');
    setRoomId('');

    const s = shortSuffix();
    setSuffix(s);

    setSelectedProject(null);
    setOpenDialog('create');
  };

  const openRename = (project: Project) => {
    setProjectName(project.name);
    setSelectedProject(project);
    setOpenDialog('rename');
  };

  const openDelete = (project: Project) => {
    setSelectedProject(project);
    setOpenDialog('delete');
  };

  const closeDialog = () => {
    if (loading) return;

    setOpenDialog(null);
    setSelectedProject(null);
    setProjectName('');
    setRoomId('');
  };

  const updateProjectName = (name: string) => {
    setProjectName(name);

    if (name.trim()) {
      const base = slugify(name);
      setRoomId(`${base}-${suffix}`);
    } else {
      setRoomId('');
    }
  };

  const createProject = async () => {
    const name = projectName.trim();

    if (!name) return;

    setLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          id: roomId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const { project }: { project: Project } = await response.json();

      closeDialog();
      router.refresh();

      router.push(`/editor/${project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setLoading(false);
    }
  };

  const renameProject = async () => {
    if (!selectedProject) return;

    const name = projectName.trim();

    if (!name) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename project');
      }

      closeDialog();
      router.refresh();
    } catch (error) {
      console.error('Failed to rename project:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async () => {
    if (!selectedProject) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      const activeSlug = window.location.pathname.split('/').pop();

      closeDialog();

      if (activeSlug === selectedProject.slug) {
        router.push('/editor');
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    openDialog,
    selectedProject,
    loading,

    projectName,
    updateProjectName,
    roomId,

    openCreate,
    openRename,
    openDelete,
    closeDialog,

    createProject,
    renameProject,
    deleteProject,
  };
}
