import { useEffect, useCallback, useState } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (event: KeyboardEvent) => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch &&
          (shortcut.meta === undefined || metaMatch)
        ) {
          event.preventDefault();
          shortcut.handler(event);
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

export function useKeyboardNavigation(
  items: string[],
  onSelect: (index: number) => void,
  enabled = true
) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || items.length === 0) return;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : items.length - 1;
            return newIndex;
          });
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = prev < items.length - 1 ? prev + 1 : 0;
            return newIndex;
          });
          break;
        case 'Enter':
          event.preventDefault();
          onSelect(selectedIndex);
          break;
        case 'Escape':
          event.preventDefault();
          // Let parent handle escape
          break;
      }
    },
    [enabled, items.length, selectedIndex, onSelect]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return { selectedIndex, setSelectedIndex };
}
