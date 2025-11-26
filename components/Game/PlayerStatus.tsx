"use client";

import { Player, PlayerType } from "@/types";
import { Circle, X, Swords, Trophy, Clock } from "lucide-react";
import React, { useMemo } from "react";
import { useGameStore } from "@/store/useGameStore";
import WinnerModal from "./WinnerModal";

export const PlayerStatus: React.FC<{
  gameId: string;
  userId: string;
  currentPlayer: PlayerType;
  actualPlayer: Player;
  sendMessage: (message: any) => void;
}> = React.memo(({ currentPlayer, gameId, actualPlayer, sendMessage, userId }) => {
  const { games } = useGameStore();
  const winner = useMemo<PlayerType>(
    () => games[gameId]?.winner,
    [gameId, games],
  );

  const isYourTurn =
    actualPlayer?.status === "PLAYER" &&
    currentPlayer === actualPlayer?.symbol &&
    !winner;

  const getStatusConfig = () => {
    if (winner) {
      return {
        bg: "from-amber-100 via-yellow-100 to-amber-100 dark:from-amber-900/40 dark:via-yellow-900/40 dark:to-amber-900/40",
        border: "border-amber-300 dark:border-amber-600",
        text: "text-amber-800 dark:text-amber-200",
        icon: <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />,
        glow: "shadow-amber-200/50 dark:shadow-amber-900/30"
      };
    }
    if (isYourTurn) {
      return {
        bg: "from-green-100 via-emerald-100 to-green-100 dark:from-green-900/40 dark:via-emerald-900/40 dark:to-green-900/40",
        border: "border-green-400 dark:border-green-600",
        text: "text-green-800 dark:text-green-200",
        icon: <Swords className="w-6 h-6 sm:w-7 sm:h-7 animate-bounce-subtle" />,
        glow: "shadow-green-200/50 dark:shadow-green-900/30"
      };
    }
    return {
      bg: "from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-800",
      border: "border-slate-200 dark:border-slate-700",
      text: "text-slate-600 dark:text-slate-400",
      icon: <Clock className="w-6 h-6 sm:w-7 sm:h-7" />,
      glow: ""
    };
  };

  const getStatusText = () => {
    if (winner === "T") return "GAME TIED";
    if (winner) return winner === actualPlayer?.symbol ? "VICTORY!" : "DEFEAT";
    if (isYourTurn) return "YOUR TURN";
    return "WAITING...";
  };

  const config = getStatusConfig();

  return (
    <div className={`flex flex-col w-full mb-4 sm:mb-6 smooth-transition animate-fadeInUp`}>
      <div className={`w-full p-3 sm:p-4 rounded-2xl border-2 bg-gradient-to-r shadow-lg ${config.bg} ${config.border} ${config.glow} ${config.text} flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-white/40 dark:bg-black/20 rounded-xl">
            {currentPlayer === "X" ? (
              <X className={`w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 ${isYourTurn ? "animate-pulse" : ""}`} />
            ) : (
              <Circle className={`w-5 h-5 sm:w-6 sm:h-6 text-rose-500 dark:text-rose-400 ${isYourTurn ? "animate-pulse" : ""}`} />
            )}
          </div>
          <div>
            <span className="text-sm sm:text-base md:text-lg font-extrabold tracking-wide block">
              {getStatusText()}
            </span>
            {!winner && actualPlayer?.status === "PLAYER" && (
              <span className="text-xs opacity-70 hidden sm:block">
                {isYourTurn ? "Make your move!" : "Opponent is thinking..."}
              </span>
            )}
          </div>
        </div>
        
        {actualPlayer?.status === "PLAYER" && (
          <div className="flex items-center gap-2 px-3 py-1.5 sm:py-2 bg-white/50 dark:bg-black/30 rounded-xl backdrop-blur-sm border border-white/20 dark:border-slate-700/30">
            <span className="text-xs font-bold opacity-80 hidden sm:block">YOU</span>
            <div className={`p-1 rounded-lg ${actualPlayer.symbol === "X" ? "bg-blue-100 dark:bg-blue-900/40" : "bg-rose-100 dark:bg-rose-900/40"}`}>
              {actualPlayer.symbol === "X" ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 stroke-[3]" />
              ) : (
                <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 dark:text-rose-400 stroke-[3]" />
              )}
            </div>
          </div>
        )}
      </div>

      {winner && <WinnerModal winner={winner} gameState={games[gameId]} sendMessage={sendMessage} userId={userId} />}
    </div>
  );
});
