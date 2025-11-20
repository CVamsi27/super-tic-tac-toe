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
          ? "bg-gradient-to-br from-blue-200 to-blue-300 shadow-lg"
          : "bg-gradient-to-br from-red-200 to-red-300 shadow-lg";
      }
      return isActive
        ? "bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 shadow-lg border-4 border-blue-500 dark:border-blue-400 ring-2 ring-blue-300 dark:ring-blue-600"
        : "opacity-30 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-300 dark:border-slate-700";
    }, [board, isActive]);

    return (
      <div
        className={`grid grid-cols-3 gap-1 sm:gap-1.5 w-fit rounded-lg sm:rounded-xl p-2 sm:p-3 smooth-transition transform ${
          isActive ? "scale-105 hover:scale-110" : ""
        } ${getBoardStatus()}`}
      >
        {board.map((cell, cellIndex) => (
          <button
            key={cellIndex}
            className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-sm sm:rounded-md bg-white/30 dark:bg-slate-900/30 border border-slate-300 dark:border-slate-600 ${
              isActive && !cell
                ? "hover:bg-white/70 dark:hover:bg-slate-800/50 cursor-pointer"
                : ""
            } ${cell !== null || disabled ? "" : "hover:scale-110"} smooth-transition transform ${
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
            {cell === "X" ? (
              <X className="w-4 h-4 sm:w-6 sm:h-6 animate-scaleIn" />
            ) : cell === "O" ? (
              <Circle className="w-4 h-4 sm:w-6 sm:h-6 animate-scaleIn" />
            ) : null}
          </button>
        ))}
      </div>
    );
  },
);
