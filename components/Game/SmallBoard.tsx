"use client";

import { SmallBoardType, WebSocketMessage } from "@/types";
import { Circle, X } from "lucide-react";
import React, { useCallback } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export const SmallBoard: React.FC<{
  gameId: string;
  userId: string;
  board: SmallBoardType;
  boardIndex: number;
  isActive: boolean;
  disabled: boolean;
  sendMessage: (message: WebSocketMessage) => void;
}> = React.memo(
  ({ gameId, userId, board, boardIndex, isActive, disabled, sendMessage }) => {
    const { playMove } = useSoundEffects();
    
    const getBoardStatus = useCallback(() => {
      if (board.every((cell) => cell === board[0] && cell !== null)) {
        return board[0] === "X"
          ? "bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 dark:from-blue-900/50 dark:via-blue-800/40 dark:to-blue-900/50 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30 border-2 border-blue-300 dark:border-blue-600 ring-2 ring-blue-200/50 dark:ring-blue-700/30"
          : "bg-gradient-to-br from-rose-100 via-red-50 to-rose-100 dark:from-rose-900/50 dark:via-red-800/40 dark:to-rose-900/50 shadow-lg shadow-rose-200/50 dark:shadow-rose-900/30 border-2 border-rose-300 dark:border-rose-600 ring-2 ring-rose-200/50 dark:ring-rose-700/30";
      }
      return isActive
        ? "bg-white dark:bg-slate-800 shadow-xl shadow-blue-200/40 dark:shadow-blue-900/20 border-2 border-blue-400 dark:border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/40 scale-[1.03]"
        : "opacity-50 bg-slate-100/80 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-800 grayscale-[0.4]";
    }, [board, isActive]);

    const handleCellClick = useCallback((cellIndex: number) => {
      if (disabled) return;
      
      // Play move sound
      playMove();
      
      sendMessage({
        type: "make_move",
        gameId: gameId,
        userId: userId,
        move: {
          playerId: userId,
          global_board_index: boardIndex,
          local_board_index: cellIndex,
        },
      });
    }, [disabled, playMove, sendMessage, gameId, userId, boardIndex]);

    return (
      <div
        className={`grid grid-cols-3 gap-0.5 sm:gap-1.5 w-fit rounded-xl sm:rounded-2xl p-1 sm:p-2.5 smooth-transition transform ${getBoardStatus()}`}
      >
        {board.map((cell, cellIndex) => (
          <button
            key={cellIndex}
            className={`group relative inline-flex items-center justify-center w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl ${
              isActive && !cell
                ? "bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                : "bg-slate-50/80 dark:bg-slate-900/50 border border-transparent"
            } ${cell !== null ? "bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-inner" : ""} smooth-transition transform ${
              cell === "X" ? "text-blue-600 dark:text-blue-400" : "text-rose-500 dark:text-rose-400"
            }`}
            onClick={() => handleCellClick(cellIndex)}
            disabled={cell !== null || disabled}
          >
            {/* Ghost Hover Effect */}
            {isActive && !cell && !disabled && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 animate-pulse shadow-lg shadow-blue-400/50" />
              </div>
            )}

            {cell === "X" ? (
              <X className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 animate-scaleIn stroke-[2.5] sm:stroke-[3] drop-shadow-sm" />
            ) : cell === "O" ? (
              <Circle className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 animate-scaleIn stroke-[2.5] sm:stroke-[3] drop-shadow-sm" />
            ) : null}
          </button>
        ))}
      </div>
    );
  },
);
