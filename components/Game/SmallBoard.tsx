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
          ? "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 shadow-lg border-blue-300 dark:border-blue-700"
          : "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 shadow-lg border-red-300 dark:border-red-700";
      }
      return isActive
        ? "bg-white dark:bg-slate-800 shadow-[0_0_20px_rgba(59,130,246,0.3)] dark:shadow-[0_0_20px_rgba(59,130,246,0.15)] border-2 border-blue-400 dark:border-blue-500 scale-[1.02] ring-2 ring-blue-100 dark:ring-blue-900/30"
        : "opacity-60 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 grayscale-[0.5]";
    }, [board, isActive]);

    return (
      <div
        className={`grid grid-cols-3 gap-1 sm:gap-2 w-fit rounded-xl sm:rounded-2xl p-1.5 sm:p-3 smooth-transition transform ${getBoardStatus()}`}
      >
        {board.map((cell, cellIndex) => (
          <button
            key={cellIndex}
            className={`group relative inline-flex items-center justify-center w-6 h-6 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-md sm:rounded-lg border ${
              isActive && !cell
                ? "bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
                : "bg-slate-50 dark:bg-slate-900/50 border-transparent"
            } ${cell !== null ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-inner" : ""} smooth-transition transform ${
              cell === "X" ? "text-blue-500 dark:text-blue-400" : "text-red-500 dark:text-red-400"
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
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                 <div className="w-2 h-2 rounded-full bg-blue-400/50 dark:bg-blue-400/50 animate-pulse" />
              </div>
            )}

            {cell === "X" ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6 animate-scaleIn stroke-[3] drop-shadow-sm" />
            ) : cell === "O" ? (
              <Circle className="w-4 h-4 sm:w-5 sm:h-5 animate-scaleIn stroke-[3] drop-shadow-sm" />
            ) : null}
          </button>
        ))}
      </div>
    );
  },
);
