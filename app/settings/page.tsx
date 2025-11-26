'use client';

import React from 'react';
import { useSettingsStore, ACHIEVEMENTS } from '@/store/useSettingsStore';
import { 
  Volume2, VolumeX, Sun, Moon, Monitor, Sparkles, Eye, 
  Clock, CheckCircle, Vibrate, Type, Contrast, 
  RotateCcw, ArrowLeft, Gamepad2, Trophy, Flame
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const settings = useSettingsStore();

  const toggleItems = [
    {
      category: "Audio",
      items: [
        {
          label: "Sound Effects",
          description: "Play sounds for moves and game events",
          icon: settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />,
          value: settings.soundEnabled,
          onChange: settings.setSoundEnabled,
        },
      ],
    },
    {
      category: "Visual",
      items: [
        {
          label: "Animations",
          description: "Enable smooth transitions and effects",
          icon: <Sparkles className="w-5 h-5" />,
          value: settings.showAnimations,
          onChange: settings.setShowAnimations,
        },
        {
          label: "Highlight Hints",
          description: "Show valid moves and active boards",
          icon: <Eye className="w-5 h-5" />,
          value: settings.highlightHints,
          onChange: settings.setHighlightHints,
        },
      ],
    },
    {
      category: "Gameplay",
      items: [
        {
          label: "Show Timer",
          description: "Display game duration",
          icon: <Clock className="w-5 h-5" />,
          value: settings.showTimer,
          onChange: settings.setShowTimer,
        },
        {
          label: "Confirm Moves",
          description: "Require confirmation before placing",
          icon: <CheckCircle className="w-5 h-5" />,
          value: settings.confirmMoves,
          onChange: settings.setConfirmMoves,
        },
      ],
    },
    {
      category: "Accessibility",
      items: [
        {
          label: "Haptic Feedback",
          description: "Vibration on mobile devices",
          icon: <Vibrate className="w-5 h-5" />,
          value: settings.hapticFeedback,
          onChange: settings.setHapticFeedback,
        },
        {
          label: "Large Text",
          description: "Increase text size for readability",
          icon: <Type className="w-5 h-5" />,
          value: settings.largeText,
          onChange: settings.setLargeText,
        },
        {
          label: "High Contrast",
          description: "Enhanced color contrast",
          icon: <Contrast className="w-5 h-5" />,
          value: settings.highContrast,
          onChange: settings.setHighContrast,
        },
      ],
    },
  ];

  const themeOptions = [
    { value: "light" as const, label: "Light", icon: <Sun className="w-4 h-4" /> },
    { value: "dark" as const, label: "Dark", icon: <Moon className="w-4 h-4" /> },
    { value: "system" as const, label: "System", icon: <Monitor className="w-4 h-4" /> },
  ];

  const earnedAchievements = settings.achievements;
  const allAchievements = Object.values(ACHIEVEMENTS);

  return (
    <div className="flex-1 bg-gradient-main">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 mb-5 sm:mb-6 text-white animate-fadeInUp">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl">
              <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold">Settings</h1>
              <p className="text-slate-300 mt-0.5 text-xs sm:text-sm">Customize your experience</p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-5 mb-4 sm:mb-5 animate-fadeInUp">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Your Stats
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{settings.totalGamesPlayed}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Games Played</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <div className="flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-orange-500" />
                <p className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">{settings.dailyStreak}</p>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Day Streak</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{earnedAchievements.length}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Achievements</p>
            </div>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-5 mb-4 sm:mb-5 animate-fadeInUp">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">Theme</h2>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => settings.setTheme(option.value)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  settings.theme === option.value
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Volume Slider */}
        {settings.soundEnabled && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-5 mb-4 sm:mb-5 animate-fadeInUp">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">Volume</h2>
            <div className="flex items-center gap-3">
              <VolumeX className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.soundVolume}
                onChange={(e) => settings.setSoundVolume(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <Volume2 className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-10 text-right">
                {Math.round(settings.soundVolume * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Toggle Settings */}
        {toggleItems.map((category) => (
          <div
            key={category.category}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-5 mb-4 sm:mb-5 animate-fadeInUp"
          >
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              {category.category}
            </h2>
            <div className="space-y-3">
              {category.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-600 dark:text-slate-400">{item.icon}</div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => item.onChange(!item.value)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      item.value ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        item.value ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Achievements */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-5 mb-4 sm:mb-5 animate-fadeInUp">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Achievements
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {allAchievements.map((achievement) => {
              const isEarned = earnedAchievements.includes(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-xl text-center transition-all ${
                    isEarned
                      ? "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800/50"
                      : "bg-slate-100 dark:bg-slate-700/50 opacity-50"
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <p className={`text-xs font-semibold mt-1 ${isEarned ? "text-amber-800 dark:text-amber-200" : "text-slate-500 dark:text-slate-400"}`}>
                    {achievement.name}
                  </p>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {achievement.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            if (confirm("Are you sure you want to reset all settings to default?")) {
              settings.resetSettings();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>

        {/* Keyboard Shortcuts Info */}
        <div className="mt-5 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-2">Keyboard Shortcuts</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between"><span>Reset Game</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded">R</kbd></div>
            <div className="flex justify-between"><span>Toggle Sound</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded">M</kbd></div>
            <div className="flex justify-between"><span>Settings</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded">S</kbd></div>
            <div className="flex justify-between"><span>Fullscreen</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded">F</kbd></div>
          </div>
        </div>
      </div>
    </div>
  );
}
