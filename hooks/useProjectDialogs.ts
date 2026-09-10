'use client';

import { useState } from 'react';

export interface Project {
  id: string;
  name: string;
  slug: string;
  owned: boolean;
}

type DialogType = 'create' | 'rename' | 'delete' | null;

export function useProjectDialogs(initialProjects: Project[] = []) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setOpenDialog('create');
    setSelectedProject(null);
  };

  const openRename = (project: Project) => {
    setOpenDialog('rename');
    setSelectedProject(project);
  };

  const openDelete = (project: Project) => {
    setOpenDialog('delete');
    setSelectedProject(project);
  };

  const closeDialog = () => {
    setOpenDialog(null);
    setSelectedProject(null);
  };

  const generateSlug = (name: string) =>
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const createProject = (name: string) => {
    setLoading(true);

    const slug = generateSlug(name);
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      slug,
      owned: true,
    };
    setProjects((prev) => [...prev, newProject]);
    setLoading(false);
    closeDialog();
  };

  const renameProject = (name: string) => {
    if (!selectedProject) return;
    setLoading(true);
    const slug = generateSlug(name);
    setProjects((prev) =>
      prev.map((p) => (p.id === selectedProject.id ? { ...p, name, slug } : p)),
    );
    setLoading(false);
    closeDialog();
  };

  const deleteProject = () => {
    if (!selectedProject) return;
    setLoading(true);
    setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
    setLoading(false);
    closeDialog();
  };

  return {
    projects,
    openDialog,
    selectedProject,
    loading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    createProject,
    renameProject,
    deleteProject,
  };
}
