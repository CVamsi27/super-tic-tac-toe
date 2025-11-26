"use client";

import React, { useState, useEffect } from "react";
import { Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";

const TIPS = [
  {
    title: "Control the Center",
    text: "Winning the center board gives you strategic control over the game.",
  },
  {
    title: "Think Two Steps Ahead",
    text: "Consider where your opponent will be forced to play after your move.",
  },
  {
    title: "Create Forks",
    text: "Try to set up situations where you have two ways to win.",
  },
  {
    title: "Watch the Meta-Board",
    text: "Sometimes it's better to lose a small board to gain position on the big board.",
  },
  {
    title: "Block Opponent's Progress",
    text: "Don't let your opponent get three boards in a row on the meta-board.",
  },
  {
    title: "Corner Strategy",
    text: "Corner boards can be powerful as they connect to multiple win conditions.",
  },
  {
    title: "Force Bad Moves",
    text: "Send your opponent to already-won or drawn boards to limit their options.",
  },
];

export function TipsCarousel() {
  const [currentTip, setCurrentTip] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentTip((prev) => (prev - 1 + TIPS.length) % TIPS.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentTip((prev) => (prev + 1) % TIPS.length);
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/50 p-3 sm:p-4">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 bg-amber-100 dark:bg-amber-800/40 rounded-lg shrink-0">
          <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
              Pro Tip
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrev}
                className="p-1 rounded hover:bg-amber-200/50 dark:hover:bg-amber-700/30 transition-colors"
                aria-label="Previous tip"
              >
                <ChevronLeft className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </button>
              <span className="text-2xs text-amber-600 dark:text-amber-400 font-medium min-w-[2.5rem] text-center">
                {currentTip + 1}/{TIPS.length}
              </span>
              <button
                onClick={goToNext}
                className="p-1 rounded hover:bg-amber-200/50 dark:hover:bg-amber-700/30 transition-colors"
                aria-label="Next tip"
              >
                <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </button>
            </div>
          </div>
          
          <div className="overflow-hidden">
            <div 
              className="transition-all duration-500 ease-out"
              key={currentTip}
            >
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 animate-fadeIn">
                {TIPS[currentTip].title}
              </p>
              <p className="text-2xs sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 animate-fadeIn">
                {TIPS[currentTip].text}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress dots */}
      <div className="flex justify-center gap-1 mt-2 sm:mt-3">
        {TIPS.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentTip(index);
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentTip 
                ? "bg-amber-500 w-4" 
                : "bg-amber-300 dark:bg-amber-700 hover:bg-amber-400"
            }`}
            aria-label={`Go to tip ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
