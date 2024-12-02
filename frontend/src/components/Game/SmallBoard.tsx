"use client";

import { SmallBoardType } from "@/types";
import { Circle, X } from "lucide-react";
import React, { useCallback } from "react";

export const SmallBoard: React.FC<{
  board: SmallBoardType;
  boardIndex: number;
  onCellClick: (boardIndex: number, cellIndex: number) => void;
  isActive: boolean;
  disabled: boolean;
}> = React.memo(({ board, boardIndex, onCellClick, isActive, disabled }) => {
  const getBoardStatus = useCallback(() => {
    if (board.every((cell) => cell === board[0] && cell !== null)) {
      return board[0] === "X" ? "bg-blue-200" : "bg-red-200";
    }
    return isActive ? "border-4" : "opacity-40";
  }, [board]);

  return (
    <div
      className={`grid grid-cols-3 w-fit rounded-lg p-2 ${getBoardStatus()}`}
    >
      {board.map((cell, cellIndex) => (
        <button
          key={cellIndex}
          className={`inline-flex items-center justify-center ${disabled ? "cursor-not-allowed" : ""} ${cellIndex == 0 || cellIndex == 3 || cellIndex == 6 ? "" : "border-l"}  ${cellIndex == 6 || cellIndex == 7 || cellIndex == 8 ? "" : "border-b"} w-8 h-8 ${
            cell === "X" ? "text-blue-600" : "text-red-600"
          }`}
          onClick={() => !disabled && onCellClick(boardIndex, cellIndex)}
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
});
