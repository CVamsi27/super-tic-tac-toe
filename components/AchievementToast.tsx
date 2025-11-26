"use client";

import React from "react";
import { toast } from "sonner";
import { Trophy, Star, Flame, Target, Clock, Crown, Gamepad2, Brain, Medal, Zap, Award, Shield } from "lucide-react";

// Achievement definitions with icons
export const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  first_win: <Trophy className="w-5 h-5 text-yellow-500" />,
  win_streak_3: <Flame className="w-5 h-5 text-orange-500" />,
  win_streak_5: <Flame className="w-5 h-5 text-red-500" />,
  win_streak_10: <Crown className="w-5 h-5 text-purple-500" />,
  games_10: <Gamepad2 className="w-5 h-5 text-blue-500" />,
  games_50: <Star className="w-5 h-5 text-indigo-500" />,
  games_100: <Medal className="w-5 h-5 text-amber-500" />,
  quick_win: <Zap className="w-5 h-5 text-yellow-500" />,
  ai_easy: <Target className="w-5 h-5 text-green-500" />,
  ai_medium: <Brain className="w-5 h-5 text-amber-500" />,
  ai_hard: <Shield className="w-5 h-5 text-red-500" />,
  daily_streak_7: <Award className="w-5 h-5 text-emerald-500" />,
};

export const ACHIEVEMENT_TITLES: Record<string, string> = {
  first_win: "First Victory!",
  win_streak_3: "On Fire!",
  win_streak_5: "Unstoppable!",
  win_streak_10: "Legendary Streak!",
  games_10: "Getting Started",
  games_50: "Dedicated Player",
  games_100: "True Champion",
  quick_win: "Speed Demon",
  ai_easy: "AI Apprentice",
  ai_medium: "AI Challenger",
  ai_hard: "AI Master",
  daily_streak_7: "Week Warrior",
};

export const ACHIEVEMENT_DESCRIPTIONS: Record<string, string> = {
  first_win: "Won your first game",
  win_streak_3: "Won 3 games in a row",
  win_streak_5: "Won 5 games in a row",
  win_streak_10: "Won 10 games in a row",
  games_10: "Played 10 games",
  games_50: "Played 50 games",
  games_100: "Played 100 games",
  quick_win: "Won in under 20 moves",
  ai_easy: "Beat AI on Easy mode",
  ai_medium: "Beat AI on Medium mode",
  ai_hard: "Beat AI on Hard mode",
  daily_streak_7: "Played 7 days in a row",
};

export function showAchievementToast(achievementId: string) {
  const title = ACHIEVEMENT_TITLES[achievementId] || "Achievement Unlocked!";
  const description = ACHIEVEMENT_DESCRIPTIONS[achievementId] || "";
  const icon = ACHIEVEMENT_ICONS[achievementId] || <Trophy className="w-5 h-5 text-yellow-500" />;

  toast.custom(
    (t) => (
      <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-900/40 dark:via-yellow-900/40 dark:to-amber-900/40 border border-yellow-300 dark:border-yellow-600 rounded-xl p-4 shadow-xl animate-slideIn flex items-center gap-3 min-w-[280px]">
        <div className="p-2.5 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-800/50 dark:to-amber-800/50 rounded-xl shadow-inner">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Achievement Unlocked
          </p>
          <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            {title}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          ✕
        </button>
      </div>
    ),
    {
      duration: 5000,
      position: "top-center",
    }
  );
}
