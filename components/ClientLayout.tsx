"use client";

import React, { useState, useEffect } from "react";
import { QuickSettings } from "@/components/QuickSettings";
import { ShortcutsModal } from "@/components/ShortcutsModal";
import { DailyStreakBanner } from "@/components/DailyStreak";
import { WhatsNewModal } from "@/components/WhatsNewModal";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { FeedbackPrompt } from "@/components/FeedbackPrompt";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useRouter, usePathname } from "next/navigation";

export const ClientLayout: React.FC = () => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDailyStreak, setShowDailyStreak] = useState(false);
  const { soundEnabled, setSoundEnabled, setTheme, theme } = useSettingsStore();
  const router = useRouter();
  const pathname = usePathname();

  // Check if we should show daily streak (only on home page)
  useEffect(() => {
    if (pathname === "/") {
      const today = new Date().toDateString();
      const lastShown = localStorage.getItem("streak_banner_shown");
      
      if (lastShown !== today) {
        // Small delay to let the page load
        const timer = setTimeout(() => {
          setShowDailyStreak(true);
          localStorage.setItem("streak_banner_shown", today);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", systemDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    "m": () => setSoundEnabled(!soundEnabled),
    "s": () => router.push("/settings"),
    "?": () => setShowShortcuts(true),
    "escape": () => setShowShortcuts(false),
    "f": () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    },
  });

  return (
    <>
      {/* Quick Settings floating button */}
      <QuickSettings showKeyboardShortcuts={() => setShowShortcuts(true)} />
      
      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
      
      {/* Daily Streak Banner (shows once per day on home) */}
      {showDailyStreak && (
        <DailyStreakBanner onClose={() => setShowDailyStreak(false)} />
      )}
      
      {/* What's New Modal (shows once per version) */}
      <WhatsNewModal />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Feedback Prompt (shows after 5 games) */}
      <FeedbackPrompt />
    </>
  );
};
