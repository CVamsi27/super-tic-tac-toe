"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UserSettings {
  // Audio
  soundEnabled: boolean;
  soundVolume: number;
  
  // Visual
  theme: "light" | "dark" | "system";
  showAnimations: boolean;
  highlightHints: boolean;
  
  // Gameplay
  showMoveHistory: boolean;
  showTimer: boolean;
  confirmMoves: boolean;
  
  // Accessibility
  hapticFeedback: boolean;
  largeText: boolean;
  highContrast: boolean;
  
  // Stats
  totalGamesPlayed: number;
  dailyStreak: number;
  lastPlayedDate: string | null;
  achievements: string[];
}

interface SettingsStore extends UserSettings {
  // Audio actions
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  
  // Visual actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  setShowAnimations: (show: boolean) => void;
  setHighlightHints: (show: boolean) => void;
  
  // Gameplay actions
  setShowMoveHistory: (show: boolean) => void;
  setShowTimer: (show: boolean) => void;
  setConfirmMoves: (confirm: boolean) => void;
  
  // Accessibility actions
  setHapticFeedback: (enabled: boolean) => void;
  setLargeText: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  
  // Stats actions
  incrementGamesPlayed: () => void;
  updateDailyStreak: () => void;
  addAchievement: (achievementId: string) => void;
  
  // Reset
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  soundEnabled: true,
  soundVolume: 0.5,
  theme: "system",
  showAnimations: true,
  highlightHints: true,
  showMoveHistory: false,
  showTimer: true,
  confirmMoves: false,
  hapticFeedback: true,
  largeText: false,
  highContrast: false,
  totalGamesPlayed: 0,
  dailyStreak: 0,
  lastPlayedDate: null,
  achievements: [],
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      // Audio
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setSoundVolume: (volume) => set({ soundVolume: Math.max(0, Math.min(1, volume)) }),

      // Visual
      setTheme: (theme) => set({ theme }),
      setShowAnimations: (show) => set({ showAnimations: show }),
      setHighlightHints: (show) => set({ highlightHints: show }),

      // Gameplay
      setShowMoveHistory: (show) => set({ showMoveHistory: show }),
      setShowTimer: (show) => set({ showTimer: show }),
      setConfirmMoves: (confirm) => set({ confirmMoves: confirm }),

      // Accessibility
      setHapticFeedback: (enabled) => set({ hapticFeedback: enabled }),
      setLargeText: (enabled) => set({ largeText: enabled }),
      setHighContrast: (enabled) => set({ highContrast: enabled }),

      // Stats
      incrementGamesPlayed: () =>
        set((state) => ({ totalGamesPlayed: state.totalGamesPlayed + 1 })),

      updateDailyStreak: () => {
        const today = new Date().toDateString();
        const { lastPlayedDate, dailyStreak } = get();

        if (lastPlayedDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastPlayedDate === yesterday.toDateString()) {
          set({ dailyStreak: dailyStreak + 1, lastPlayedDate: today });
        } else {
          set({ dailyStreak: 1, lastPlayedDate: today });
        }
      },

      addAchievement: (achievementId) =>
        set((state) => {
          if (state.achievements.includes(achievementId)) return state;
          return { achievements: [...state.achievements, achievementId] };
        }),

      resetSettings: () => set(defaultSettings),
    }),
    {
      name: "super-ttt-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Achievement definitions
export const ACHIEVEMENTS = {
  FIRST_WIN: { id: "first_win", name: "First Victory", description: "Win your first game", icon: "🏆" },
  STREAK_3: { id: "streak_3", name: "On Fire", description: "Win 3 games in a row", icon: "🔥" },
  STREAK_7: { id: "streak_7", name: "Unstoppable", description: "Win 7 games in a row", icon: "⚡" },
  GAMES_10: { id: "games_10", name: "Getting Started", description: "Play 10 games", icon: "🎮" },
  GAMES_50: { id: "games_50", name: "Dedicated Player", description: "Play 50 games", icon: "🎯" },
  GAMES_100: { id: "games_100", name: "Century", description: "Play 100 games", icon: "💯" },
  AI_EASY: { id: "ai_easy", name: "Baby Steps", description: "Beat Easy AI", icon: "🤖" },
  AI_MEDIUM: { id: "ai_medium", name: "Rising Star", description: "Beat Medium AI", icon: "⭐" },
  AI_HARD: { id: "ai_hard", name: "AI Slayer", description: "Beat Hard AI", icon: "👑" },
  DAILY_3: { id: "daily_3", name: "Consistent", description: "3-day play streak", icon: "📅" },
  DAILY_7: { id: "daily_7", name: "Weekly Warrior", description: "7-day play streak", icon: "🗓️" },
  QUICK_WIN: { id: "quick_win", name: "Speed Demon", description: "Win in under 20 moves", icon: "💨" },
} as const;
