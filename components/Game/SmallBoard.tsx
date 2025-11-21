"use client";

import { SmallBoardType, WebSocketMessage } from "@/types";
import { Circle, X } from "lucide-react";
import React, { useCallback } from "react";

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
    const getBoardStatus = useCallback(() => {
      if (board.every((cell) => cell === board[0] && cell !== null)) {
        return board[0] === "X"
          ? "bg-gradient-to-br from-blue-200 to-blue-300 shadow-lg opacity-80"
          : "bg-gradient-to-br from-red-200 to-red-300 shadow-lg opacity-80";
      }
      return isActive
        ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-[0_0_15px_rgba(59,130,246,0.5)] dark:shadow-[0_0_15px_rgba(59,130,246,0.3)] border-2 border-blue-400 dark:border-blue-500 scale-[1.02]"
        : "opacity-40 bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 grayscale";
    }, [board, isActive]);

    return (
      <div
        className={`grid grid-cols-3 gap-1 sm:gap-1.5 w-fit rounded-lg sm:rounded-xl p-2 sm:p-3 smooth-transition transform ${getBoardStatus()}`}
      >
        {board.map((cell, cellIndex) => (
          <button
            key={cellIndex}
            className={`group relative inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-sm sm:rounded-md bg-white/40 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-600 ${
              isActive && !cell
                ? "hover:bg-white/80 dark:hover:bg-slate-800/80 cursor-pointer hover:shadow-inner"
                : ""
            } ${cell !== null || disabled ? "" : ""} smooth-transition transform ${
              cell === "X" ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"
            }`}
            onClick={() => {
              if (disabled) return;
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
            }}
            disabled={cell !== null || disabled}
          >
            {/* Ghost Hover Effect */}
            {isActive && !cell && !disabled && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-20 transition-opacity duration-200">
                 <div className="w-2 h-2 rounded-full bg-current" />
              </div>
            )}

            {cell === "X" ? (
              <X className="w-4 h-4 sm:w-6 sm:h-6 animate-scaleIn stroke-[2.5]" />
            ) : cell === "O" ? (
              <Circle className="w-4 h-4 sm:w-6 sm:h-6 animate-scaleIn stroke-[2.5]" />
            ) : null}
          </button>
        ))}
      </div>
    );
  },
);
