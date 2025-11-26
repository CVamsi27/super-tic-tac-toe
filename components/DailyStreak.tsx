"use client";

import React, { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Flame, Calendar, Gift, X, Sparkles, Trophy, Zap, Star } from "lucide-react";

interface DailyStreakProps {
  onClose?: () => void;
}

// Get streak tier info based on streak count
const getStreakTier = (streak: number) => {
  if (streak >= 100) return { name: "Legendary", emoji: "👑", color: "from-purple-500 via-pink-500 to-red-500" };
  if (streak >= 60) return { name: "Master", emoji: "💎", color: "from-cyan-500 via-blue-500 to-purple-500" };
  if (streak >= 30) return { name: "Expert", emoji: "🏆", color: "from-yellow-500 via-orange-500 to-red-500" };
  if (streak >= 14) return { name: "Dedicated", emoji: "⭐", color: "from-orange-400 via-orange-500 to-red-500" };
  if (streak >= 7) return { name: "Committed", emoji: "🔥", color: "from-orange-500 to-red-600" };
  if (streak >= 3) return { name: "Rising", emoji: "✨", color: "from-amber-500 to-orange-600" };
  return { name: "Starter", emoji: "🌱", color: "from-green-500 to-emerald-600" };
};

export const DailyStreakBanner: React.FC<DailyStreakProps> = ({ onClose }) => {
  const { dailyStreak, lastPlayedDate, updateDailyStreak } = useSettingsStore();
  const [showBanner, setShowBanner] = useState(false);
  const [isNewDay, setIsNewDay] = useState(false);
  const [animateFlames, setAnimateFlames] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    
    // Check if this is a new day
    if (lastPlayedDate !== today) {
      setIsNewDay(true);
      setShowBanner(true);
      updateDailyStreak();
      
      // Trigger flame animation
      setTimeout(() => setAnimateFlames(true), 300);
    }
  }, [lastPlayedDate, updateDailyStreak]);

  if (!showBanner) return null;

  const milestones = [3, 7, 14, 30, 60, 100];
  const nextMilestone = milestones.find(m => m > dailyStreak) || dailyStreak + 10;
  const prevMilestone = [...milestones].reverse().find(m => m <= dailyStreak) || 0;
  const progressRange = nextMilestone - prevMilestone;
  const currentProgress = dailyStreak - prevMilestone;
  const progress = (currentProgress / progressRange) * 100;
  
  const tier = getStreakTier(dailyStreak);
  const daysToNext = nextMilestone - dailyStreak;

  // Generate week view (last 7 days)
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={() => { setShowBanner(false); onClose?.(); }}
      />
      
      {/* Modal */}
      <div className={`relative bg-gradient-to-br ${tier.color} rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn`}>
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {animateFlames && [...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-float opacity-20"
              style={{
                left: `${15 + i * 15}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + i * 0.3}s`
              }}
            >
              {i % 2 === 0 ? '🔥' : '✨'}
            </div>
          ))}
        </div>

        {/* Header pattern */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 to-transparent" />

        {/* Close button */}
        <button
          onClick={() => { setShowBanner(false); onClose?.(); }}
          className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 rounded-full transition-all hover:scale-110 z-10"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Content */}
        <div className="relative p-6 text-center text-white">
          {/* Tier badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold mb-4">
            <span>{tier.emoji}</span>
            <span>{tier.name} Streak</span>
          </div>

          {/* Main flame icon with glow */}
          <div className="relative inline-flex items-center justify-center mb-2">
            <div className="absolute inset-0 bg-yellow-400/40 blur-2xl rounded-full scale-150" />
            <div className={`relative w-24 h-24 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg ${animateFlames ? 'animate-pulse' : ''}`}>
              <Flame className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" />
            </div>
            {/* Sparkle effects */}
            {animateFlames && (
              <>
                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-200 animate-ping" />
                <Star className="absolute -bottom-1 -left-2 w-5 h-5 text-yellow-200 animate-bounce" fill="currentColor" />
              </>
            )}
          </div>

          {/* Streak count */}
          <div className="mb-1">
            <span className="text-6xl font-black tracking-tight drop-shadow-lg">
              {dailyStreak}
            </span>
          </div>
          <p className="text-lg font-semibold text-white/90 mb-1">
            Day Streak!
          </p>
          <p className="text-sm text-white/70 mb-5">
            {isNewDay ? "🎉 Amazing! You're on fire!" : "Keep the momentum going!"}
          </p>

          {/* Week progress indicator */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/80 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                This Week
              </span>
              <span className="text-xs text-white/60">
                {dailyStreak >= 7 ? '7/7 🏆' : `${Math.min(dailyStreak, 7)}/7`}
              </span>
            </div>
            <div className="flex justify-between gap-1.5">
              {weekDays.map((day, i) => {
                const isToday = i === today;
                const isPast = i < today;
                const isActive = (isPast && dailyStreak >= (today - i)) || isToday;
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-2xs text-white/60">{day}</span>
                    <div 
                      className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                        isToday 
                          ? 'bg-white text-orange-500 ring-2 ring-white/50 ring-offset-2 ring-offset-transparent' 
                          : isActive 
                            ? 'bg-white/30' 
                            : 'bg-black/20'
                      }`}
                    >
                      {isActive && (
                        <Flame className={`w-3.5 h-3.5 ${isToday ? 'text-orange-500' : 'text-white'}`} fill="currentColor" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress to next milestone */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                Next Milestone
              </span>
              <span className="text-white/80 font-semibold">{nextMilestone} days</span>
            </div>
            <div className="h-3 bg-black/30 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-white rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            <p className="text-xs text-white/70 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-yellow-300" />
              {daysToNext === 1 
                ? "Just 1 more day to go!" 
                : `${daysToNext} more days to unlock!`
              }
            </p>
          </div>

          {/* Rewards hint */}
          <div className="flex items-center justify-center gap-2 text-sm text-white/80 mb-4">
            <Gift className="w-4 h-4" />
            <span>Reach milestones to unlock achievements!</span>
          </div>

          {/* Action button */}
          <button
            onClick={() => { setShowBanner(false); onClose?.(); }}
            className="w-full py-3.5 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Continue Playing 🎮
          </button>
        </div>
      </div>
    </div>
  );
};

// Small inline streak display (enhanced)
export const StreakBadge: React.FC<{ className?: string; showLabel?: boolean }> = ({ 
  className = "",
  showLabel = false 
}) => {
  const { dailyStreak } = useSettingsStore();

  if (dailyStreak === 0) return null;

  const tier = getStreakTier(dailyStreak);

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r ${tier.color} text-white rounded-full text-xs font-bold shadow-lg ${className}`}>
      <Flame className="w-3.5 h-3.5" fill="currentColor" />
      <span>{dailyStreak}</span>
      {showLabel && <span className="text-white/80">day{dailyStreak !== 1 ? 's' : ''}</span>}
    </div>
  );
};
