"use client";

import { PlayerType, SmallBoardType } from "@/types";
import { useCallback } from "react";

export const useWinnerCheck = () => {
  const checkBoardWinner = useCallback(
    (board: SmallBoardType): PlayerType | "T" | null => {
      const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];

      for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a] as PlayerType;
        }
      }

      return board.every((cell) => cell !== null) ? "T" : null;
    },
    [],
  );

  return { checkBoardWinner };
};
