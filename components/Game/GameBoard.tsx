"use client";
import { GameBoardType, WebSocketMessage } from "@/types";
import React, { useEffect, useMemo, useRef } from "react";
import { SmallBoard } from "./SmallBoard";
import { useGameStore } from "@/store/useGameStore";

export const GameBoard: React.FC<{
  gameId: string;
  userId: string;
  sendMessage: (message: WebSocketMessage) => void;
}> = React.memo(({ userId, gameId, sendMessage }) => {
  const { games, initializeGame } = useGameStore();

  useEffect(() => {
    if (!games[gameId]) {
      initializeGame(gameId);
    }
  }, [gameId, games, initializeGame]);

  const globalBoard = useMemo<GameBoardType>(
    () =>
      games[gameId]?.globalBoard ??
      Array(9)
        .fill(null)
        .map(() => Array(9).fill(null)),
    [gameId, games],
  );
  const activeBoard = useMemo(
    () => games[gameId]?.activeBoard,
    [gameId, games],
  );

  const playableBoardIndices = useMemo(() => {
    if (activeBoard !== null) return [activeBoard];

    return globalBoard.reduce((acc, board, index) => {
      if (board.some((cell) => cell === null)) acc.push(index);
      return acc;
    }, [] as number[]);
  }, [globalBoard, activeBoard]);

  return (
    <div className="grid grid-cols-3 gap-4 md:gap-8 w-fit p-4 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-xl border border-blue-200 dark:border-slate-600 shadow-lg smooth-transition">
      {globalBoard.map((board, boardIndex) => (
        <SmallBoard
          userId={userId}
          gameId={gameId}
          key={boardIndex}
          board={board}
          boardIndex={boardIndex}
          isActive={
            playableBoardIndices.includes(boardIndex) && !games[gameId]?.winner
          }
          disabled={!!games[gameId]?.winner}
          sendMessage={sendMessage}
        />
      ))}
    </div>
  );
});
