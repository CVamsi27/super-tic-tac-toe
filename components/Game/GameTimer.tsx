"use client";

import React, { useEffect } from "react";
import { useGameTimer } from "@/hooks/useGameTimer";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Clock, Pause, Play } from "lucide-react";

interface GameTimerProps {
  isGameActive: boolean;
  gameStarted: boolean;
  className?: string;
}

export const GameTimer: React.FC<GameTimerProps> = ({
  isGameActive,
  gameStarted,
  className = "",
}) => {
  const { showTimer } = useSettingsStore();
  const { formattedTime, start, pause, reset, isRunning } = useGameTimer();

  useEffect(() => {
    if (gameStarted && isGameActive) {
      start();
    } else if (!isGameActive) {
      pause();
    }
  }, [gameStarted, isGameActive, start, pause]);

  useEffect(() => {
    if (!gameStarted) {
      reset();
    }
  }, [gameStarted, reset]);

  if (!showTimer) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 dark:bg-slate-700 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-600 ${className}`}
    >
      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400" />
      <span className="font-mono font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-300 min-w-[40px] sm:min-w-[45px]">
        {formattedTime}
      </span>
      {isRunning ? (
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
      ) : (
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full" />
      )}
    </div>
  );
};
