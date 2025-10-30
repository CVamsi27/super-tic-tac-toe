"use client";

import { Copy, Check } from "lucide-react";
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
      className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs sm:text-sm"
      title="Copy game link to share"
    >
      {isCopied ? (
        <>
          <Check className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Copy Link</span>
        </>
      )}
    </button>
  );
};
