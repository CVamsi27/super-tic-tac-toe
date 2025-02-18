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
        return board[0] === "X" ? "bg-blue-200" : "bg-red-200";
      }
      return isActive ? "bg-secondary" : "opacity-40";
    }, [board, isActive]);

    return (
      <div
        className={`grid grid-cols-3 w-fit rounded-lg p-2 ${getBoardStatus()}`}
      >
        {board.map((cell, cellIndex) => (
          <button
            key={cellIndex}
            className={`inline-flex items-center justify-center ${isActive ? "border-foreground" : ""} ${disabled ? "cursor-not-allowed" : ""} ${cellIndex == 0 || cellIndex == 3 || cellIndex == 6 ? "" : "border-l"}  ${cellIndex == 6 || cellIndex == 7 || cellIndex == 8 ? "" : "border-b"} w-8 h-8 ${
              cell === "X" ? "text-blue-600" : "text-red-600"
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
              <X className="w-6 h-6" />
            ) : cell === "O" ? (
              <Circle className="w-6 h-6" />
            ) : null}
          </button>
        ))}
      </div>
    );
  },
);
