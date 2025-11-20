"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerStatus } from "./PlayerStatus";
import { GameBoard } from "./GameBoard";
import { useParams } from "next/navigation";
import { ResetGame } from "./ResetGame";
import { CopyGameUrl } from "./CopyGameUrl";
import { useGameSocket } from "@/hooks/useGameWebSocket";
import { Bot, Eye } from "lucide-react";

const SuperTicTacToe: React.FC<{ userId: string }> = ({ userId }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const { gameState, sendMessage } = useGameSocket(gameId, userId);
  const isAIGame = gameState?.mode === "ai";
  const isGameReady = gameState !== null;
  
  return (
    <div
      className={`flex flex-col items-center justify-start bg-gradient-main h-full p-3 sm:p-4 md:p-6 overflow-y-auto smooth-transition gap-4`}
    >
      {/* Share Game - Top Section (Only for Remote games) */}
      {isGameReady && !isAIGame && (
        <div className="w-fit max-w-4xl animate-slideInDown">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-blue-100 dark:border-slate-600 shadow-md">
            <CopyGameUrl gameId={gameId} />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              First to join becomes player 2, others watch
            </p>
          </div>
        </div>
      )}
      
      {/* AI Game Indicator */}
      {isGameReady && isAIGame && (
        <div className="w-fit max-w-4xl animate-slideInDown">
          <div className="flex items-center justify-center gap-2 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border border-purple-200 dark:border-purple-700 shadow-md">
            <Bot size={24} className="text-purple-600 dark:text-purple-400" />
            <p className="text-sm sm:text-base font-semibold text-purple-700 dark:text-purple-300">
              Playing against AI
            </p>
          </div>
        </div>
      )}

      <Card className="w-fit max-w-4xl p-3 sm:p-4 md:p-6 shadow-2xl border-0 bg-gradient-card animate-scaleIn">
        <CardHeader className="py-2 sm:py-3">
          <CardTitle className="text-center flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <span className="text-sm sm:text-base md:text-lg text-primary font-semibold flex items-center gap-2">
              <Eye size={20} />
              Watchers: {gameState?.watchers || 0}
            </span>
            <ResetGame
              classname={`${
                gameState?.players.find((p) => p?.id === userId)?.status ===
                "WATCHER"
                  ? "pointer-events-none opacity-50"
                  : ""
              } smooth-transition`}
              gameId={gameId}
              userId={userId}
              sendMessage={sendMessage}
            />
          </CardTitle>
        </CardHeader>
        <CardContent
          className={`gap-2 p-2 sm:p-3 md:p-4  ${
            (gameState?.players.find((p) => p?.id === userId)?.status ===
              "WATCHER" ||
              gameState?.currentPlayer !==
                gameState?.players.find((p) => p?.id === userId)?.symbol ||
              gameState?.currentPlayer === null) &&
            gameState.winner === null
              ? "pointer-events-none opacity-60"
              : ""
          } smooth-transition`}
        >
          <PlayerStatus
            gameId={gameId}
            currentPlayer={gameState?.currentPlayer || null}
            actualPlayer={
              gameState?.players.find((p) => p?.id === userId) || null
            }
          />
          <GameBoard
            gameId={gameId}
            userId={userId}
            sendMessage={sendMessage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperTicTacToe;
