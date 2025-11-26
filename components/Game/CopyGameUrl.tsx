"use client";

import { Share2, Check, Link2 } from "lucide-react";
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
      toast.success("Link copied!", {
        description: "Share with friends to play together",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy", {
        description: "Please try again",
      });
    }
  };

  return (
    <button
      onClick={handleCopyUrl}
      className={`inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-300 transform active:scale-95 text-xs sm:text-sm ${
        isCopied
          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/25"
          : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 hover:shadow-xl"
      }`}
      title="Share game link"
    >
      {isCopied ? (
        <>
          <Check className="w-4 h-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Link2 className="w-4 h-4" />
          <span>Share Link</span>
        </>
      )}
    </button>
  );
};
