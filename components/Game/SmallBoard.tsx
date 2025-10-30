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
        ? "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 shadow-md border-2 border-blue-400 dark:border-blue-500"
        : "opacity-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700";
    }, [board, isActive]);

    return (
      <div
        className={`grid grid-cols-3 w-fit rounded-lg sm:rounded-xl p-1 sm:p-2 smooth-transition transform ${
          isActive ? "scale-105 hover:scale-110" : ""
        } ${getBoardStatus()}`}
      >
        {board.map((cell, cellIndex) => (
          <button
            key={cellIndex}
            className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-sm sm:rounded-md ${
              isActive && !cell
                ? "hover:bg-white/50 dark:hover:bg-black/20 cursor-pointer"
                : ""
            } ${cell !== null || disabled ? "" : "hover:scale-110"} smooth-transition transform ${
              isActive ? "border-slate-400 dark:border-slate-500" : ""
            } ${cellIndex == 0 || cellIndex == 3 || cellIndex == 6 ? "" : "border-l"}  ${
              cellIndex == 6 || cellIndex == 7 || cellIndex == 8 ? "" : "border-b"
            } ${cell === "X" ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}
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
