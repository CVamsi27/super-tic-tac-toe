"use client";

import React, { useState, useEffect } from "react";
import { Star, X, MessageSquare, ThumbsUp } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";

export function FeedbackPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { totalGamesPlayed } = useSettingsStore();

  useEffect(() => {
    // Show feedback prompt after 5 games, only once
    const hasSeenPrompt = localStorage.getItem("feedback_prompt_seen");
    if (!hasSeenPrompt && totalGamesPlayed >= 5) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [totalGamesPlayed]);

  const handleClose = () => {
    localStorage.setItem("feedback_prompt_seen", "true");
    setIsOpen(false);
  };

  const handleSubmit = () => {
    localStorage.setItem("feedback_prompt_seen", "true");
    localStorage.setItem("user_rating", rating.toString());
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6 animate-scaleIn">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div className="text-center mb-5">
              <div className="inline-flex p-3 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-2xl mb-3">
                <MessageSquare className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                Enjoying the game?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                We&apos;d love to hear your feedback!
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-1 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                Maybe Later
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Submit
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="inline-flex p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
              <ThumbsUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Thank you!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your feedback helps us improve.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
