"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyGameUrlProps {
  gameId: string;
}

export const CopyGameUrl: React.FC<CopyGameUrlProps> = ({ gameId }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyUrl = async () => {
    const gameUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/game/${gameId}`;
    try {
      await navigator.clipboard.writeText(gameUrl);
      setIsCopied(true);
      toast.success("Link copied to clipboard!", {
        description: "Share this with your friend to play together",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link", {
        description: "Please try again or copy manually",
      });
    }
  };

  return (
    <button
      onClick={handleCopyUrl}
      className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs sm:text-sm"
      title="Share game link"
    >
      {isCopied ? (
        <>
          <Check className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Share Game</span>
        </>
      )}
    </button>
  );
};
