"use client";

import { SmallBoardType, WebSocketMessage } from "@/types";
import { Circle, X } from "lucide-react";
import React, { useCallback } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

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
    const { playMove } = useSoundEffects();
    
    const getBoardStatus = useCallback(() => {
      if (board.every((cell) => cell === board[0] && cell !== null)) {
        return board[0] === "X"
          ? "bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 dark:from-blue-800/70 dark:via-blue-700/60 dark:to-blue-800/70 shadow-md dark:shadow-lg dark:shadow-blue-800/40 border-2 border-blue-400 dark:border-blue-500 ring-2 ring-blue-200/50 dark:ring-blue-600/40"
          : "bg-gradient-to-br from-rose-100 via-rose-50 to-rose-100 dark:from-rose-800/70 dark:via-red-700/60 dark:to-rose-800/70 shadow-md dark:shadow-lg dark:shadow-rose-800/40 border-2 border-rose-400 dark:border-rose-500 ring-2 ring-rose-200/50 dark:ring-rose-600/40";
      }
      return isActive
        ? "bg-white dark:bg-slate-700 shadow-lg dark:shadow-xl dark:shadow-blue-700/30 border-2 border-blue-500 dark:border-blue-400 ring-2 ring-blue-100 dark:ring-4 dark:ring-blue-600/50 scale-[1.02]"
        : "bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-600 shadow-sm dark:opacity-60 dark:grayscale-[0.3]";
    }, [board, isActive]);

    const handleCellClick = useCallback((cellIndex: number) => {
      if (disabled) return;
      
      // Play move sound
      playMove();
      
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
    }, [disabled, playMove, sendMessage, gameId, userId, boardIndex]);

    return (
      <div
        className={`grid grid-cols-3 w-fit rounded-lg sm:rounded-2xl smooth-transition transform ${getBoardStatus()}`}
        style={{ gap: 'var(--cell-gap)', padding: 'var(--board-padding)' }}
      >
        {board.map((cell, cellIndex) => (
          <button
            key={cellIndex}
            className={`group relative inline-flex items-center justify-center rounded sm:rounded-xl ${
              isActive && !cell
                ? "bg-white dark:bg-slate-600 hover:bg-blue-50 dark:hover:bg-blue-800/50 border border-slate-300 dark:border-slate-500 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                : "bg-slate-100/80 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600"
            } ${cell !== null ? "bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 shadow-inner" : ""} smooth-transition transform ${
              cell === "X" ? "text-blue-600 dark:text-blue-300" : "text-rose-500 dark:text-rose-300"
            }`}
            style={{ width: 'var(--cell-size)', height: 'var(--cell-size)' }}
            onClick={() => handleCellClick(cellIndex)}
            disabled={cell !== null || disabled}
          >
            {/* Ghost Hover Effect */}
            {isActive && !cell && !disabled && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 dark:from-blue-300 dark:to-indigo-300 animate-pulse shadow-lg shadow-blue-400/50" />
              </div>
            )}

            {cell === "X" ? (
              <X style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }} className="animate-scaleIn stroke-[3] drop-shadow-md dark:drop-shadow-[0_2px_3px_rgba(147,197,253,0.3)]" />
            ) : cell === "O" ? (
              <Circle style={{ width: 'var(--icon-size-small)', height: 'var(--icon-size-small)' }} className="animate-scaleIn stroke-[3] drop-shadow-md dark:drop-shadow-[0_2px_3px_rgba(253,164,175,0.3)]" />
            ) : null}
          </button>
        ))}
      </div>
    );
  },
);
