"use client";

import React from "react";
import { Clock, Zap, Target, TrendingUp } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";

interface GameStatsProps {
  moveCount: number;
  gameDuration?: number; // in seconds
  isWinner: boolean;
}

export function GameStats({ moveCount, gameDuration, isWinner }: GameStatsProps) {
  const { totalGamesPlayed, dailyStreak } = useSettingsStore();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const stats = [
    {
      icon: <Target className="w-4 h-4" />,
      label: "Moves",
      value: moveCount,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    ...(gameDuration !== undefined ? [{
      icon: <Clock className="w-4 h-4" />,
      label: "Duration",
      value: formatDuration(gameDuration),
      color: "text-green-500",
      bg: "bg-green-100 dark:bg-green-900/30",
    }] : []),
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: "Games",
      value: totalGamesPlayed,
      color: "text-purple-500",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: "Streak",
      value: `${dailyStreak}d`,
      color: "text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 mb-2">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`flex flex-col items-center p-2.5 rounded-xl ${stat.bg} border border-slate-200/50 dark:border-slate-700/50`}
        >
          <div className={`${stat.color} mb-1`}>
            {stat.icon}
          </div>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {stat.value}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
