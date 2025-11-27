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
          ? "bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 dark:from-blue-950 dark:via-blue-900 dark:to-blue-950 shadow-md dark:shadow-lg dark:shadow-blue-500/30 border-2 border-blue-400 dark:border-blue-500"
          : "bg-gradient-to-br from-rose-100 via-rose-50 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-rose-950 shadow-md dark:shadow-lg dark:shadow-rose-500/30 border-2 border-rose-400 dark:border-rose-500";
      }
      return isActive
        ? "bg-white dark:bg-slate-800/50 backdrop-blur-sm shadow-lg dark:shadow-xl dark:shadow-blue-500/20 border-2 border-blue-500 dark:border-blue-400"
        : "bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 shadow-sm opacity-50 dark:opacity-40";
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
        className={`grid grid-cols-3 gap-1 sm:gap-1.5 md:gap-2 w-full h-full aspect-square rounded-lg sm:rounded-2xl p-1 sm:p-1.5 md:p-2 smooth-transition ${getBoardStatus()}`}
      >
        {board.map((cell, cellIndex) => (
          <button
            key={cellIndex}
            className={`group relative inline-flex items-center justify-center w-full h-full aspect-square rounded sm:rounded-lg md:rounded-xl ${
              isActive && !cell
                ? "bg-white dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                : "bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800"
            } ${cell !== null ? (isActive ? "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-inner" : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800") : ""} smooth-transition transform`}
            onClick={() => handleCellClick(cellIndex)}
            disabled={cell !== null || disabled}
          >
            {/* Ghost Hover Effect */}
            {isActive && !cell && !disabled && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                <div className="w-1/3 h-1/3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 dark:from-blue-300 dark:to-indigo-300 animate-pulse shadow-lg shadow-blue-400/50" />
              </div>
            )}

            {cell === "X" ? (
              <X 
                className={`w-2/3 h-2/3 animate-scaleIn stroke-[3] ${
                  isActive 
                    ? "text-blue-500 dark:text-sky-400 drop-shadow-md dark:drop-shadow-[0_2px_4px_rgba(56,189,248,0.6)]" 
                    : "text-blue-400/50 dark:text-sky-600/50"
                }`} 
              />
            ) : cell === "O" ? (
              <Circle 
                className={`w-2/3 h-2/3 animate-scaleIn stroke-[3] ${
                  isActive 
                    ? "text-rose-500 dark:text-orange-400 drop-shadow-md dark:drop-shadow-[0_2px_4px_rgba(251,146,60,0.6)]" 
                    : "text-rose-400/50 dark:text-orange-600/50"
                }`} 
              />
            ) : null}
          </button>
        ))}
      </div>
    );
  },
);
