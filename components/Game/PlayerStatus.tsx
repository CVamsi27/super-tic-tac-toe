"use client";

import { Player, PlayerType } from "@/types";
import { Circle, X } from "lucide-react";
import React, { useMemo } from "react";
import { Loading } from "../ui/loading";
import { useGameStore } from "@/store/useGameStore";
import WinnerModal from "./WinnerModal";

export const PlayerStatus: React.FC<{
  gameId: string;
  currentPlayer: PlayerType;
  actualPlayer: Player;
}> = React.memo(({ currentPlayer, gameId, actualPlayer }) => {
  const { games } = useGameStore();
  const winner = useMemo<PlayerType>(
    () => games[gameId]?.winner,
    [gameId, games],
  );

  const isYourTurn =
    actualPlayer?.status === "PLAYER" &&
    currentPlayer === actualPlayer?.symbol &&
    !winner;

  const getStatusColor = () => {
    if (winner) return "from-amber-100 to-yellow-200 dark:from-amber-900/40 dark:to-yellow-900/40 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200";
    if (isYourTurn) return "from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-900/40 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 animate-pulse-subtle";
    return "from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400";
  };

  const getStatusText = () => {
    if (winner) return winner === actualPlayer?.symbol ? "VICTORY!" : "DEFEAT";
    if (isYourTurn) return "YOUR TURN";
    return "OPPONENT'S TURN";
  };

  return (
    <div className={`flex flex-col w-full mb-6 smooth-transition animate-slideInDown`}>
      <div className={`w-full p-4 rounded-xl border-2 bg-gradient-to-r shadow-lg flex items-center justify-between ${getStatusColor()}`}>
        <div className="flex items-center gap-3">
          {currentPlayer === "X" ? (
            <X className={`w-8 h-8 ${isYourTurn ? "animate-bounce" : ""}`} />
          ) : (
            <Circle className={`w-8 h-8 ${isYourTurn ? "animate-bounce" : ""}`} />
          )}
          <span className="text-sm md:text-base lg:text-2xl font-black tracking-wider">
            {getStatusText()}
          </span>
        </div>
        
        {actualPlayer?.status === "PLAYER" && (
          <div className="flex items-center gap-2 px-3 py-1 bg-white/30 dark:bg-black/20 rounded-lg backdrop-blur-sm">
            <span className="text-sm font-semibold opacity-80">YOU ARE</span>
            {actualPlayer.symbol === "X" ? (
              <X className="w-5 h-5 font-bold" />
            ) : (
              <Circle className="w-5 h-5 font-bold" />
            )}
          </div>
        )}
      </div>

      {winner && <WinnerModal winner={winner} gameState={games[gameId]} />}
    </div>
  );
});
