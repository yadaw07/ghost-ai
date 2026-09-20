import { useEffect } from 'react';

import { ReactFlowInstance } from '@xyflow/react';

export function useKeyboardShortcuts(
  flowInstance: ReactFlowInstance | null,
  undo: () => void,
  redo: () => void,
  onDelete?: () => void,
) {
  useEffect(() => {
    if (!flowInstance) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts while typing in inputs, textareas, or editable text fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMod = event.ctrlKey || event.metaKey;

      // Delete: Delete or Backspace
      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        onDelete
      ) {
        event.preventDefault();
        onDelete();
      }
      // Zoom in: + or =
      else if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        flowInstance.zoomIn();
      }
      // Zoom out: -
      else if (event.key === '-') {
        event.preventDefault();
        flowInstance.zoomOut();
      }
      // Undo: Cmd/Ctrl + Z
      else if (isMod && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      else if (
        (isMod && event.shiftKey && event.key.toLowerCase() === 'z') ||
        (isMod && event.key.toLowerCase() === 'y')
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flowInstance, undo, redo, onDelete]);
}
