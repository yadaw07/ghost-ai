'use client';

import { useState } from 'react';

import { EditorNavbar } from './editor-navbar';
import { ProjectSidebar } from './project-sidebar';

export function Editor() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <ProjectSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <main className='flex flex-1'>
        <p className='text-primary'>Your editor/canvas will go here </p>
      </main>
    </div>
  );
}
