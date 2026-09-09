'use client';

import { UserButton } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';

interface EditorNavbarProps {
  /** Whether the sidebar is currently open */
  isSidebarOpen: boolean;
  /** Callback to toggle the sidebar state */
  toggleSidebar: () => void;
}

/** Top navigation bar for the editor view */
export function EditorNavbar({
  isSidebarOpen,
  toggleSidebar,
}: EditorNavbarProps) {
  const Icon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <header className='flex h-12 items-center justify-between bg-base border-b border-subtle px-4'>
      {/* Left section – sidebar toggle button */}
      <Button variant='ghost' size='icon-sm' onClick={toggleSidebar}>
        <Icon className='h-5 w-5' />
        <span className='sr-only'>
          {isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        </span>
      </Button>

      {/* Center section – placeholder for future controls */}
      <div className='flex-1' />

      {/* Right section – currently empty */}
      <div className='w-8' />

      <UserButton />
    </header>
  );
}
