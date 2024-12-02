"use client";
import { GameBoardType, PlayerType } from "@/types";
import React, { useMemo } from "react";
import { SmallBoard } from "./SmallBoard";

export const GameBoard: React.FC<{
  globalBoard: GameBoardType;
  activeBoard: number | null;
  makeMove: (boardIndex: number, cellIndex: number) => void;
  winner: PlayerType | null;
}> = React.memo(({ globalBoard, activeBoard, makeMove, winner }) => {
  const playableBoardIndices = useMemo(() => {
    if (activeBoard !== null) return [activeBoard];

    return globalBoard.reduce((acc, board, index) => {
      if (board.some((cell) => cell === null)) acc.push(index);
      return acc;
    }, [] as number[]);
  }, [globalBoard, activeBoard]);

  return (
    <div className="grid grid-cols-3 gap-8 w-fit">
      {globalBoard.map((board, boardIndex) => (
        <SmallBoard
          key={boardIndex}
          board={board}
          boardIndex={boardIndex}
          onCellClick={makeMove}
          isActive={playableBoardIndices.includes(boardIndex)}
          disabled={!!winner}
        />
      ))}
    </div>
  );
});
