"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerStatus } from "./PlayerStatus";
import { GameBoard } from "./GameBoard";
import { useParams } from "next/navigation";
import { ResetGame } from "./ResetGame";
import { CopyGameUrl } from "./CopyGameUrl";
import { useGameSocket } from "@/hooks/useGameWebSocket";
import { GameTimer } from "./GameTimer";
import { ShareGame } from "@/components/ShareGame";
import { GameToolbar } from "@/components/GameToolbar";
import { ShortcutsModal } from "@/components/ShortcutsModal";
import { Bot, Eye } from "lucide-react";

const SuperTicTacToe: React.FC<{ userId: string }> = ({ userId }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const { gameState, sendMessage } = useGameSocket(gameId, userId);
  const [showHelp, setShowHelp] = useState(false);
  const isAIGame = gameState?.mode === "ai";
  const isGameReady = gameState !== null;
  const isGameOver = gameState?.winner !== null;
  const gameStarted = isGameReady && gameState.players.length === 2;
  const isGameActive = gameStarted && !isGameOver;
  const canReset = gameState?.mode !== "random" && 
    gameState?.players?.find((p) => p?.id === userId)?.status !== "WATCHER";

  const handleReset = () => {
    if (canReset) {
      sendMessage({
        type: "reset_game",
        gameId: gameId,
        userId: userId,
      });
    }
  };
  
  return (
    <div className="flex-1 flex flex-col items-center justify-start bg-gradient-main p-2 sm:p-4 md:p-6 smooth-transition gap-3 sm:gap-4 md:gap-5">
      {/* Info Banner */}
      {isGameReady && !isAIGame && (
        <div className="w-full max-w-xl animate-fadeInUp">
          <div className="flex flex-col xs:flex-row items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 glass rounded-xl sm:rounded-2xl border border-blue-200/50 dark:border-slate-600/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <CopyGameUrl gameId={gameId} />
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 text-center xs:text-left">
                Share link for spectators
              </p>
            </div>
            <ShareGame gameId={gameId} />
          </div>
        </div>
      )}
      
      {isGameReady && isAIGame && (
        <div className="w-full max-w-xl animate-fadeInUp">
          <div className="flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 backdrop-blur-md rounded-xl sm:rounded-2xl border border-violet-200/50 dark:border-violet-700/50 shadow-sm">
            <div className="p-2 bg-violet-200/50 dark:bg-violet-800/30 rounded-xl">
              <Bot size={20} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-violet-800 dark:text-violet-200">
                AI Challenge Mode
              </p>
              <p className="text-xs text-violet-600 dark:text-violet-400 hidden sm:block">
                Test your skills against the computer
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Game Card */}
      <Card className="w-full max-w-xl p-3 sm:p-4 md:p-6 shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-scaleIn ring-1 ring-slate-200/80 dark:ring-slate-700/80 rounded-2xl sm:rounded-3xl">
        <CardHeader className="py-0 px-0 pb-3 sm:pb-4">
          <CardTitle className="flex flex-row justify-between items-center gap-3 w-full">
            <div className="flex items-center gap-2 h-9 sm:h-10 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-3 sm:px-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{gameState?.watchers || 0} watching</span>
            </div>
            
            {/* Game Timer */}
            <GameTimer isGameActive={isGameActive} gameStarted={gameStarted} />
            
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
              ? "pointer-events-none opacity-85"
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
      
      {/* Bottom Toolbar */}
      <GameToolbar 
        onReset={canReset ? handleReset : undefined}
        onHelp={() => setShowHelp(true)}
        showReset={canReset}
      />
      
      {/* Help Modal */}
      <ShortcutsModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

export default SuperTicTacToe;
