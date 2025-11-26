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
    <div className="relative">
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 blur-3xl -z-10 rounded-full scale-110" />
      
      <div 
        className="grid grid-cols-3 w-fit bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl sm:rounded-3xl border-2 border-slate-300/80 dark:border-slate-600/80 shadow-2xl smooth-transition"
        style={{ gap: 'var(--board-gap)', padding: 'var(--container-padding)' }}
      >
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
    </div>
  );
});
