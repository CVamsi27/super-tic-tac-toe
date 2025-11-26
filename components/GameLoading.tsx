"use client";

import React from "react";
import { Gamepad2 } from "lucide-react";

interface GameLoadingProps {
  message?: string;
}

export function GameLoading({ message = "Loading game..." }: GameLoadingProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-main p-4">
      <div className="flex flex-col items-center gap-6 p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl animate-scaleIn">
        {/* Animated game icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-40 animate-pulse" />
          <div className="relative p-5 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-2xl">
            <Gamepad2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-bounce" />
          </div>
        </div>
        
        {/* Loading text */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {message}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Setting up your game session
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-loading-bar" />
        </div>
        
        {/* Tips while loading */}
        <div className="text-center max-w-xs">
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            💡 Tip: Win three small boards in a row to win the game!
          </p>
        </div>
      </div>
    </div>
  );
}
