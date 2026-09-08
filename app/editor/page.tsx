// components/editor/editor-shell.tsx
'use client';

import { useState } from 'react';

import { EditorNavbar } from '@/components/editor/editor-navbar';
import { ProjectSidebar } from '@/components/editor/project-sidebar';

export function EditorShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((v) => !v)}
      />
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </>
  );
}
