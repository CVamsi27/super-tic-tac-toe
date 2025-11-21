"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerStatus } from "./PlayerStatus";
import { GameBoard } from "./GameBoard";
import { useParams } from "next/navigation";
import { ResetGame } from "./ResetGame";
import { CopyGameUrl } from "./CopyGameUrl";
import { useGameSocket } from "@/hooks/useGameWebSocket";
import { Bot } from "lucide-react";

const SuperTicTacToe: React.FC<{ userId: string }> = ({ userId }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const { gameState, sendMessage } = useGameSocket(gameId, userId);
  const isAIGame = gameState?.mode === "ai";
  const isGameReady = gameState !== null;
  
  return (
    <div
      className={`flex flex-col items-center justify-start bg-gradient-main h-full p-3 sm:p-4 md:p-6 overflow-y-auto smooth-transition gap-3 sm:gap-4 md:gap-6`}
    >
      {isGameReady && !isAIGame && (
        <div className="w-fit max-w-4xl animate-slideInDown">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-xl border border-blue-100 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-300">
            <CopyGameUrl gameId={gameId} />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Share the game link for others to spectate the match.
            </p>
          </div>
        </div>
      )}
      
      {isGameReady && isAIGame && (
        <div className="w-fit max-w-4xl animate-slideInDown">
          <div className="flex items-center justify-center gap-2 p-3 sm:p-4 bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-md rounded-xl border border-purple-200 dark:border-purple-700 shadow-sm">
            <Bot size={24} className="text-purple-600 dark:text-purple-400" />
            <p className="text-sm sm:text-base font-semibold text-purple-700 dark:text-purple-300">
              Playing against AI
            </p>
          </div>
        </div>
      )}

      <Card className="w-fit max-w-4xl p-4 sm:p-6 md:p-8 shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl animate-scaleIn ring-1 ring-slate-200 dark:ring-slate-700">
        <CardHeader className="py-0 px-0 pb-4">
          <CardTitle className="text-center flex flex-row justify-between items-center gap-4 w-full">
            <span className="h-10 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
              <span className="whitespace-nowrap">Watchers: {gameState?.watchers || 0}</span>
            </span>
            {gameState?.mode !== "random" && (
              <ResetGame
                classname={`${
                  gameState?.players?.find((p) => p?.id === userId)?.status ===
                  "WATCHER"
                    ? "pointer-events-none opacity-50"
                    : ""
                } smooth-transition`}
                gameId={gameId}
                userId={userId}
                sendMessage={sendMessage}
              />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent
          className={`gap-4 p-0 ${
            (gameState?.players?.find((p) => p?.id === userId)?.status ===
              "WATCHER" ||
              gameState?.currentPlayer !==
                gameState?.players?.find((p) => p?.id === userId)?.symbol ||
              gameState?.currentPlayer === null) &&
            gameState.winner === null
              ? "pointer-events-none opacity-80 grayscale-[0.3]"
              : ""
          } smooth-transition`}
        >
          <PlayerStatus
            gameId={gameId}
            userId={userId}
            currentPlayer={gameState?.currentPlayer || null}
            actualPlayer={
              gameState?.players?.find((p) => p?.id === userId) || null
            }
            sendMessage={sendMessage}
          />
          <div className="flex justify-center">
            <GameBoard
              gameId={gameId}
              userId={userId}
              sendMessage={sendMessage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperTicTacToe;
