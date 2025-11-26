"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcuts {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts, enabled: boolean = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Build shortcut key from event
      const parts: string[] = [];
      if (event.ctrlKey || event.metaKey) parts.push("ctrl");
      if (event.altKey) parts.push("alt");
      if (event.shiftKey) parts.push("shift");
      parts.push(event.key.toLowerCase());

      const shortcutKey = parts.join("+");

      // Check for matching shortcut
      if (shortcuts[shortcutKey]) {
        event.preventDefault();
        shortcuts[shortcutKey]();
      }

      // Also check for single key shortcuts
      if (shortcuts[event.key.toLowerCase()]) {
        event.preventDefault();
        shortcuts[event.key.toLowerCase()]();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

// Predefined game shortcuts
export const GAME_SHORTCUTS = {
  RESET: "r",
  UNDO: "ctrl+z",
  SETTINGS: "s",
  MUTE: "m",
  FULLSCREEN: "f",
  HELP: "?",
  ESCAPE: "escape",
} as const;
