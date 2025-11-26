"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Volume2, Trophy, Clock, Lightbulb, Settings, Keyboard, Flame } from "lucide-react";

const FEATURES = [
  {
    icon: <Volume2 className="w-5 h-5" />,
    title: "Sound Effects",
    description: "Satisfying audio feedback for moves, wins, and game events",
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: "Achievements",
    description: "Unlock 12 unique achievements as you play and improve",
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    icon: <Flame className="w-5 h-5" />,
    title: "Daily Streaks",
    description: "Build your streak by playing every day",
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Game Timer",
    description: "Track how long your games take",
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    icon: <Settings className="w-5 h-5" />,
    title: "Settings & Themes",
    description: "Customize your experience with light/dark mode and more",
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: <Keyboard className="w-5 h-5" />,
    title: "Keyboard Shortcuts",
    description: "Press ? anytime to see available shortcuts",
    color: "text-indigo-500",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    title: "Strategy Tips",
    description: "Learn pro tips on the home page carousel",
    color: "text-yellow-500",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
  },
];

const WHATS_NEW_VERSION = "1.1.0";

export function WhatsNewModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const seenVersion = localStorage.getItem("whats_new_seen");
    if (seenVersion !== WHATS_NEW_VERSION) {
      // Delay showing to not overwhelm on first load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("whats_new_seen", WHATS_NEW_VERSION);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[85vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 sm:p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">What&apos;s New!</h2>
              <p className="text-sm text-white/80">Version {WHATS_NEW_VERSION}</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[50vh]">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            We&apos;ve added exciting new features to enhance your gaming experience!
          </p>
          
          <div className="space-y-3">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 animate-fadeInUp"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`p-2 rounded-lg ${feature.bg} ${feature.color}`}>
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.98]"
          >
            Got it, let&apos;s play!
          </button>
        </div>
      </div>
    </div>
  );
}
