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
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 sm:mb-6 font-semibold text-base sm:text-lg p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-lg sm:rounded-xl border border-blue-100 dark:border-slate-600 smooth-transition animate-slideInDown">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-slate-700 dark:text-slate-200">Current Player:</span>
        {currentPlayer === null ? (
          <Loading />
        ) : currentPlayer === "X" ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
        ) : (
          <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 animate-pulse" />
        )}
      </div>
      {actualPlayer?.status === "PLAYER" && (
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2 bg-white/50 dark:bg-slate-900/50 rounded-lg">
          <span className="text-slate-700 dark:text-slate-200">Your Symbol:</span>
          {actualPlayer === null ? (
            <Loading />
          ) : actualPlayer.symbol === "X" ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 font-bold" />
          ) : (
            <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 font-bold" />
          )}
        </div>
      )}

      {winner && <WinnerModal winner={winner} gameState={games[gameId]} />}
    </div>
  );
});
