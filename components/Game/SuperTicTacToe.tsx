"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerStatus } from "./PlayerStatus";
import { GameBoard } from "./GameBoard";
import { useParams, useSearchParams } from "next/navigation";
import { useGameStore } from "@/store/useGameStore";
import { GameModeType } from "@/types";

import { CopyGameUrl } from "./CopyGameUrl";
import { useGameSocket } from "@/hooks/useGameWebSocket";
import { GameTimer } from "./GameTimer";
import { ShareGame } from "@/components/ShareGame";
import { GameToolbar } from "@/components/GameToolbar";
import { ShortcutsModal } from "@/components/ShortcutsModal";
import { Bot, Eye, Home, Settings, Trophy, HelpCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const SuperTicTacToe: React.FC<{ userId: string }> = ({ userId }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const searchParams = useSearchParams();
  const { initializeGame } = useGameStore();

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode && Object.values(GameModeType).includes(mode as GameModeType)) {
      initializeGame(gameId, mode as GameModeType);
    }
  }, [gameId, searchParams, initializeGame]);
  const { gameState, sendMessage } = useGameSocket(gameId, userId);
  const [showHelp, setShowHelp] = useState(false);
  const { playClick } = useSoundEffects();
  
  const isAIGame = gameState?.mode === "ai";
  const isGameReady = gameState !== null;
  const isGameOver = gameState?.winner !== null;
  const gameStarted = isGameReady && gameState.players.length === 2;
  const isGameActive = gameStarted && !isGameOver;


  const handleToolbarClick = (callback?: () => void) => {
    playClick();
    callback?.();
  };
  
  return (
    <div className="flex-1 flex flex-col items-center justify-start lg:justify-center bg-gradient-main p-2 sm:p-4 md:p-6 smooth-transition gap-3 sm:gap-4 md:gap-5 lg:h-[100dvh] lg:overflow-hidden">
      {/* Info Banner - Mobile Only */}
      <div className="lg:hidden w-full max-w-xl flex flex-col gap-3">
        {isGameReady && !isAIGame && (
          <div className="w-full animate-fadeInUp">
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
          <div className="w-full animate-fadeInUp">
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
      </div>

      {/* Game Card */}
      <Card className="w-full max-w-xl lg:max-w-7xl lg:w-full lg:h-[min(90vh,800px)] p-3 sm:p-4 md:p-6 shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-scaleIn ring-1 ring-slate-200/80 dark:ring-slate-700/80 rounded-2xl sm:rounded-3xl flex flex-col lg:flex-row lg:gap-8 lg:items-center transition-all duration-500">
        
        {/* Left Column (Desktop) / Header (Mobile) */}
        <div className="flex flex-col gap-4 w-full lg:w-[380px] lg:shrink-0 lg:h-full lg:py-4">
          {/* Header Content */}
          <div className="flex flex-row justify-between items-center gap-3 w-full lg:bg-slate-50 lg:dark:bg-slate-800/50 lg:p-4 lg:rounded-2xl lg:border lg:border-slate-200 lg:dark:border-slate-700">
            <div className="flex items-center gap-2 h-9 sm:h-10 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-3 sm:px-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{gameState?.watchers || 0} <span className="hidden sm:inline lg:hidden xl:inline">watching</span></span>
            </div>
            
            {/* Game Timer */}
            <GameTimer isGameActive={isGameActive} gameStarted={gameStarted} />
            
            {/* Mobile Rules Button */}
            <Link href="/rules" onClick={() => handleToolbarClick()} className="lg:hidden">
              <button className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 transition-all flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 hidden sm:inline">Rules</span>
              </button>
            </Link>
          </div>

          {/* Desktop Info Banners */}
          <div className="hidden lg:flex flex-col gap-3">
             {isGameReady && !isAIGame && (
                <div className="flex items-center justify-between gap-2 p-3 glass rounded-xl border border-blue-200/50 dark:border-slate-600/50">
                  <div className="flex items-center gap-2">
                    <CopyGameUrl gameId={gameId} />
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Share link
                    </p>
                  </div>
                  <ShareGame gameId={gameId} />
                </div>
             )}
             {isGameReady && isAIGame && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 backdrop-blur-md rounded-xl border border-violet-200/50 dark:border-violet-700/50">
                  <div className="p-1.5 bg-violet-200/50 dark:bg-violet-800/30 rounded-lg">
                    <Bot size={18} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-violet-800 dark:text-violet-200">AI Challenge</p>
                  </div>
                </div>
             )}
          </div>

          {/* Player Status */}
          <div className="lg:mt-4">
            <PlayerStatus
              gameId={gameId}
              userId={userId}
              currentPlayer={gameState?.currentPlayer || null}
              actualPlayer={
                gameState?.players?.find((p) => p?.id === userId) || null
              }
              sendMessage={sendMessage}
            />
          </div>

          {/* Desktop Toolbar */}
          <div className="hidden lg:grid grid-cols-2 gap-3 mt-auto">
            <Link href="/" onClick={() => handleToolbarClick()} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all group">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                <Home className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-500" />
              </div>
              <span className="font-medium text-slate-600 dark:text-slate-300">Home</span>
            </Link>

            <Link href="/rules" onClick={() => handleToolbarClick()} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all group">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-500" />
              </div>
              <span className="font-medium text-slate-600 dark:text-slate-300">Rules</span>
            </Link>

            <Link href="/leaderboard" onClick={() => handleToolbarClick()} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all group">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                <Trophy className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-amber-500" />
              </div>
              <span className="font-medium text-slate-600 dark:text-slate-300">Ranks</span>
            </Link>

            <Link href="/settings" onClick={() => handleToolbarClick()} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all group">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-500" />
              </div>
              <span className="font-medium text-slate-600 dark:text-slate-300">Settings</span>
            </Link>

            <button onClick={() => handleToolbarClick(() => setShowHelp(true))} className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 transition-all group">
              <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-700 dark:text-blue-300">How to Play</span>
            </button>
          </div>
        </div>

        {/* Right Column (Desktop) / Body (Mobile) */}
        <div className="flex-1 flex items-center justify-center w-full h-full lg:bg-slate-50/50 lg:dark:bg-slate-800/20 lg:rounded-2xl lg:border lg:border-slate-100 lg:dark:border-slate-800/50">
          <CardContent
            className={`gap-4 p-0 w-full flex justify-center ${
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
            <GameBoard
              gameId={gameId}
              userId={userId}
              sendMessage={sendMessage}
            />
          </CardContent>
        </div>
      </Card>
      
      {/* Bottom Toolbar - Mobile Only */}
      <div className="lg:hidden">
        <GameToolbar 
          onHelp={() => setShowHelp(true)}
        />
      </div>
      
      {/* Help Modal */}
      <ShortcutsModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

export default SuperTicTacToe;
