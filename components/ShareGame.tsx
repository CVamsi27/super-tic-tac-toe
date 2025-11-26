"use client";

import React, { useState } from "react";
import { Share2, Copy, Check, Twitter, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ShareGameProps {
  gameId: string;
  className?: string;
}

export function ShareGame({ gameId, className = "" }: ShareGameProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const gameUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/game/${gameId}` 
    : "";

  const shareText = "Join me for a game of Super Tic-Tac-Toe! 🎮";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(gameUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Super Tic-Tac-Toe",
          text: shareText,
          url: gameUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(gameUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${gameUrl}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={shareNative}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium text-sm hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-xl active:scale-95"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Share Game</span>
      </button>

      {/* Share dropdown for browsers without native share */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 animate-scaleIn">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 px-1">
              Share this game
            </p>
            
            {/* Copy link button */}
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
            >
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {copied ? "Copied!" : "Copy link"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                  {gameUrl}
                </p>
              </div>
            </button>

            <div className="border-t border-slate-200 dark:border-slate-700 my-2" />

            {/* Social share buttons */}
            <div className="flex gap-2">
              <button
                onClick={shareTwitter}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[#1DA1F2] text-white hover:bg-[#1a8cd8] transition-colors"
              >
                <Twitter className="w-4 h-4" />
                <span className="text-sm font-medium">Twitter</span>
              </button>
              <button
                onClick={shareWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
