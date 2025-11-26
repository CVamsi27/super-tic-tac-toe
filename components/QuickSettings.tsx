"use client";

import React, { useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { 
  Settings, Volume2, VolumeX, Sun, Moon, X, 
  Sparkles, Eye, Keyboard
} from "lucide-react";
import Link from "next/link";

interface QuickSettingsProps {
  showKeyboardShortcuts?: () => void;
}

export const QuickSettings: React.FC<QuickSettingsProps> = ({ showKeyboardShortcuts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    soundEnabled, 
    setSoundEnabled, 
    theme, 
    setTheme,
    showAnimations,
    setShowAnimations,
    highlightHints,
    setHighlightHints,
  } = useSettingsStore();
  const { playClick } = useSoundEffects();

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      // Play sound after enabling
      setTimeout(() => playClick(), 50);
    }
  };

  const toggleTheme = () => {
    const themes: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    playClick();
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light": return <Sun className="w-4 h-4" />;
      case "dark": return <Moon className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Quick Actions Panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 mb-2 animate-fadeInUp">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 min-w-[200px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Quick Settings</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-2">
              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-sm text-slate-700 dark:text-slate-300">Sound</span>
                </div>
                <span className={`text-xs font-medium ${soundEnabled ? 'text-green-600' : 'text-slate-400'}`}>
                  {soundEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {getThemeIcon()}
                  <span className="text-sm text-slate-700 dark:text-slate-300">Theme</span>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                  {theme}
                </span>
              </button>

              {/* Animations Toggle */}
              <button
                onClick={() => { setShowAnimations(!showAnimations); playClick(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${showAnimations ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Animations</span>
                </div>
                <span className={`text-xs font-medium ${showAnimations ? 'text-green-600' : 'text-slate-400'}`}>
                  {showAnimations ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Hints Toggle */}
              <button
                onClick={() => { setHighlightHints(!highlightHints); playClick(); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Eye className={`w-4 h-4 ${highlightHints ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`} />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Hints</span>
                </div>
                <span className={`text-xs font-medium ${highlightHints ? 'text-green-600' : 'text-slate-400'}`}>
                  {highlightHints ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Keyboard Shortcuts */}
              {showKeyboardShortcuts && (
                <button
                  onClick={() => { showKeyboardShortcuts(); playClick(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Keyboard className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Shortcuts</span>
                  <kbd className="ml-auto text-2xs px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-slate-500 dark:text-slate-400">?</kbd>
                </button>
              )}

              {/* Full Settings Link */}
              <Link
                href="/settings"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                onClick={() => playClick()}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">All Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          playClick();
        }}
        className={`p-3 sm:p-3.5 rounded-full shadow-lg transition-all duration-300 ${
          isOpen 
            ? 'bg-slate-700 dark:bg-slate-600 rotate-90' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
        }`}
      >
        <Settings className={`w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
    </div>
  );
};
