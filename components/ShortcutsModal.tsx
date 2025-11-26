"use client";

import React from "react";
import { X, Keyboard } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: "R", description: "Reset/Restart game" },
  { key: "M", description: "Toggle sound on/off" },
  { key: "S", description: "Open settings" },
  { key: "F", description: "Toggle fullscreen" },
  { key: "?", description: "Show keyboard shortcuts" },
  { key: "Esc", description: "Close modals/menus" },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-2">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
            >
              <span className="text-sm text-slate-700 dark:text-slate-300">{shortcut.description}</span>
              <kbd className="px-2.5 py-1 bg-slate-200 dark:bg-slate-600 rounded-lg text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 min-w-[40px] text-center">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-4 pt-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
