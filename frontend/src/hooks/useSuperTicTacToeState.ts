"use client";

import { GameBoardType, PlayerType } from "@/types";
import { useCallback, useState } from "react";
import { useWinnerCheck } from "./useWinnerCheck";

export const useSuperTicTacToeState = (gameId: string) => {
  console.log(gameId);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerType>("X");
  const [globalBoard, setGlobalBoard] = useState<GameBoardType>(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(null)),
  );
  const [activeBoard, setActiveBoard] = useState<number | null>(null);
  const [winner, setWinner] = useState<PlayerType | null>(null);

  const { checkBoardWinner } = useWinnerCheck();

  const findNextActiveBoard = useCallback(
    (
      currentCellIndex: number,
      currentGlobalBoard: GameBoardType,
    ): number | null => {
      if (currentGlobalBoard[currentCellIndex].every((cell) => cell !== null)) {
        const availableBoards = currentGlobalBoard.reduce(
          (acc, board, index) => {
            if (board.some((cell) => cell === null)) acc.push(index);
            return acc;
          },
          [] as number[],
        );

        return availableBoards.length > 0 ? availableBoards[0] : null;
      }
      return currentCellIndex;
    },
    [],
  );

  const makeMove = useCallback(
    (boardIndex: number, cellIndex: number) => {
      if (
        winner ||
        globalBoard[boardIndex][cellIndex] ||
        (activeBoard !== null && boardIndex !== activeBoard)
      ) {
        return;
      }

      const newGlobalBoard = globalBoard.map((board) => [...board]);
      newGlobalBoard[boardIndex][cellIndex] = currentPlayer;

      const smallBoardWinner = checkBoardWinner(newGlobalBoard[boardIndex]);
      if (smallBoardWinner) {
        newGlobalBoard[boardIndex] = newGlobalBoard[boardIndex].map(() =>
          smallBoardWinner === "T" ? null : smallBoardWinner,
        );
      }

      const nextActiveBoard = findNextActiveBoard(cellIndex, newGlobalBoard);
      setActiveBoard(nextActiveBoard);

      const globalBoardWinner = checkBoardWinner(
        newGlobalBoard.map((board) =>
          board.every((cell) => cell === board[0] && cell !== null)
            ? board[0]
            : null,
        ),
      );

      setGlobalBoard(newGlobalBoard);

      if (globalBoardWinner && globalBoardWinner !== "T") {
        setWinner(globalBoardWinner);
      }

      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    },
    [
      currentPlayer,
      globalBoard,
      activeBoard,
      winner,
      checkBoardWinner,
      findNextActiveBoard,
    ],
  );

  const resetGame = useCallback(() => {
    setGlobalBoard(
      Array(9)
        .fill(null)
        .map(() => Array(9).fill(null)),
    );
    setCurrentPlayer("X");
    setActiveBoard(null);
    setWinner(null);
  }, []);

  return {
    globalBoard,
    currentPlayer,
    activeBoard,
    winner,
    makeMove,
    resetGame,
  };
};
