"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/ui/custom-button";
import { Circle, X, RotateCcw, Bot, Users, Home, Trophy, Sparkles } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useRouter } from "next/navigation";
import { Confetti } from "@/components/Confetti";

type CellValue = "X" | "O" | null;
type DifficultyLevel = "easy" | "medium" | "hard";

interface ClassicTicTacToeProps {
  mode: "local" | "ai";
  aiDifficulty?: DifficultyLevel;
}

const WIN_PATTERNS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal
  [2, 4, 6], // Anti-diagonal
];

const checkWinner = (board: CellValue[]): { winner: CellValue; line: number[] | null } => {
  for (const pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: pattern };
    }
  }
  return { winner: null, line: null };
};

const isBoardFull = (board: CellValue[]): boolean => {
  return board.every((cell) => cell !== null);
};

// AI Logic for Classic Tic Tac Toe
const getAIMove = (board: CellValue[], difficulty: DifficultyLevel): number => {
  const emptyCells = board.map((cell, index) => (cell === null ? index : -1)).filter((i) => i !== -1);

  if (emptyCells.length === 0) return -1;

  // Easy: Random move
  if (difficulty === "easy") {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  // Medium: 50% chance of optimal, 50% random
  if (difficulty === "medium" && Math.random() < 0.5) {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  // Hard/Medium optimal: Minimax
  return getBestMove(board);
};

const getBestMove = (board: CellValue[]): number => {
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = "O";
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
};

const minimax = (board: CellValue[], depth: number, isMaximizing: boolean): number => {
  const { winner } = checkWinner(board);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "O";
        const score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "X";
        const score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

export const ClassicTicTacToe: React.FC<ClassicTicTacToeProps> = ({
  mode,
  aiDifficulty = "medium",
}) => {
  const router = useRouter();
  const { playMove, playWin, playLose, playDraw } = useSoundEffects();
  const { showAnimations } = useSettingsStore();
  
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<CellValue>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [gameDuration, setGameDuration] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [pendingAIMove, setPendingAIMove] = useState(false);

  // Trigger AI move
  useEffect(() => {
    if (mode === "ai" && currentPlayer === "O" && !winner && !isDraw && !pendingAIMove) {
      setPendingAIMove(true);
    }
  }, [currentPlayer, mode, winner, isDraw, pendingAIMove]);

  // Execute AI move
  useEffect(() => {
    if (!pendingAIMove) return;
    
    setIsAIThinking(true);
    const timeout = setTimeout(() => {
      const aiMove = getAIMove([...board], aiDifficulty);
      if (aiMove !== -1 && board[aiMove] === null) {
        // Make AI move directly here
        const newBoard = [...board];
        newBoard[aiMove] = "O";
        setBoard(newBoard);
        setMoveCount((prev) => prev + 1);
        playMove();

        // Check for winner
        const result = checkWinner(newBoard);
        if (result.winner) {
          setWinner(result.winner);
          setWinningLine(result.line);
          setGameDuration(gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0);
          setScores((prev) => ({
            ...prev,
            [result.winner as "X" | "O"]: prev[result.winner as "X" | "O"] + 1,
          }));
          playLose();
          setTimeout(() => setShowStats(true), 1500);
        } else if (isBoardFull(newBoard)) {
          setIsDraw(true);
          setGameDuration(gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0);
          setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
          playDraw();
          setTimeout(() => setShowStats(true), 1500);
        } else {
          setCurrentPlayer("X");
        }
      }
      setIsAIThinking(false);
      setPendingAIMove(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [pendingAIMove, board, aiDifficulty, gameStartTime, playMove, playLose, playDraw]);

  const handleCellClick = useCallback(
    (index: number) => {
      if (board[index] || winner || isDraw || isAIThinking) return;
      if (mode === "ai" && currentPlayer === "O") return;

      // Start timer on first move
      if (moveCount === 0) {
        setGameStartTime(Date.now());
      }

      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      setBoard(newBoard);
      setMoveCount((prev) => prev + 1);
      playMove();

      // Check for winner
      const result = checkWinner(newBoard);
      if (result.winner) {
        setWinner(result.winner);
        setWinningLine(result.line);
        setGameDuration(gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0);
        setScores((prev) => ({
          ...prev,
          [result.winner as "X" | "O"]: prev[result.winner as "X" | "O"] + 1,
        }));

        if (mode === "ai") {
          if (result.winner === "X") {
            playWin();
          } else {
            playLose();
          }
        } else {
          playWin();
        }

        setTimeout(() => setShowStats(true), 1500);
        return;
      }

      // Check for draw
      if (isBoardFull(newBoard)) {
        setIsDraw(true);
        setGameDuration(gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0);
        setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
        playDraw();
        setTimeout(() => setShowStats(true), 1500);
        return;
      }

      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    },
    [board, currentPlayer, winner, isDraw, moveCount, gameStartTime, isAIThinking, playMove, playWin, playLose, playDraw, mode]
  );

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
    setMoveCount(0);
    setGameStartTime(null);
    setGameDuration(null);
    setShowStats(false);
  };

  const getResultForStats = () => {
    if (isDraw) return "draw";
    if (mode === "ai") {
      return winner === "X";
    }
    return true; // Local mode always shows win for the winner
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start bg-gradient-main p-4 sm:p-6 md:p-8 gap-4 sm:gap-6">
      {/* Winner Confetti */}
      {showAnimations && winner && (
        <Confetti isActive={true} />
      )}

      {/* Game Result Modal */}
      {showStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 animate-scaleIn">
            <div className="text-center mb-6">
              {isDraw ? (
                <>
                  <Sparkles className="w-16 h-16 mx-auto mb-3 text-slate-500" />
                  <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">It&apos;s a Draw!</h2>
                </>
              ) : getResultForStats() ? (
                <>
                  <Trophy className="w-16 h-16 mx-auto mb-3 text-amber-500" />
                  <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {mode === "ai" ? "You Win!" : `Player ${winner} Wins!`}
                  </h2>
                </>
              ) : (
                <>
                  <Bot className="w-16 h-16 mx-auto mb-3 text-violet-500" />
                  <h2 className="text-2xl font-bold text-violet-600 dark:text-violet-400">AI Wins!</h2>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{moveCount}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Moves</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{formatDuration(gameDuration || 0)}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Duration</p>
              </div>
            </div>

            <div className="flex gap-3">
              <CustomButton
                onClick={resetGame}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </CustomButton>
              <CustomButton
                variant="outline"
                onClick={() => {
                  setShowStats(false);
                  router.push("/");
                }}
                className="flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      {/* Mode Banner */}
      <div className="w-full max-w-md animate-fadeInUp">
        <div className={`flex items-center justify-center gap-3 p-4 rounded-2xl border shadow-sm ${
          mode === "ai"
            ? "bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 border-violet-200/50 dark:border-violet-700/50"
            : "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border-emerald-200/50 dark:border-emerald-700/50"
        }`}>
          <div className={`p-2 rounded-xl ${
            mode === "ai"
              ? "bg-violet-200/50 dark:bg-violet-800/30"
              : "bg-emerald-200/50 dark:bg-emerald-800/30"
          }`}>
            {mode === "ai" ? (
              <Bot size={20} className="text-violet-600 dark:text-violet-400" />
            ) : (
              <Users size={20} className="text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div>
            <p className={`text-sm sm:text-base font-bold ${
              mode === "ai"
                ? "text-violet-800 dark:text-violet-200"
                : "text-emerald-800 dark:text-emerald-200"
            }`}>
              {mode === "ai" ? `VS AI (${aiDifficulty})` : "Local 2 Player"}
            </p>
            <p className={`text-xs hidden sm:block ${
              mode === "ai"
                ? "text-violet-600 dark:text-violet-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}>
              Classic Tic Tac Toe
            </p>
          </div>
        </div>
      </div>

      {/* Score Board */}
      <div className="w-full max-w-md animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between gap-3 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <X className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {mode === "ai" ? "You" : "Player X"}
              </span>
            </div>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{scores.X}</span>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 text-center">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Draws</span>
            <p className="text-lg font-bold text-slate-600 dark:text-slate-300">{scores.draws}</p>
          </div>
          <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Circle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {mode === "ai" ? "AI" : "Player O"}
              </span>
            </div>
            <span className="text-2xl font-bold text-rose-500 dark:text-rose-400">{scores.O}</span>
          </div>
        </div>
      </div>

      {/* Main Game Card */}
      <Card className="w-full max-w-md p-4 sm:p-6 shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-scaleIn ring-1 ring-slate-200/80 dark:ring-slate-700/80 rounded-3xl">
        <CardHeader className="py-0 px-0 pb-4">
          <CardTitle className="flex flex-col items-center gap-3">
            {/* Current Turn / Game Status */}
            {winner ? (
              <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-2xl border border-amber-200 dark:border-amber-700/50">
                <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                <span className="text-lg font-bold text-amber-800 dark:text-amber-200">
                  {mode === "ai"
                    ? winner === "X"
                      ? "You Win! 🎉"
                      : "AI Wins!"
                    : `Player ${winner} Wins! 🎉`}
                </span>
              </div>
            ) : isDraw ? (
              <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800/50 dark:to-gray-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Sparkles className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                  It&apos;s a Draw!
                </span>
              </div>
            ) : (
              <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-300 ${
                currentPlayer === "X"
                  ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700/50"
                  : "bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 border-rose-200 dark:border-rose-700/50"
              }`}>
                {currentPlayer === "X" ? (
                  <X className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Circle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                )}
                <span className={`text-lg font-bold ${
                  currentPlayer === "X"
                    ? "text-blue-800 dark:text-blue-200"
                    : "text-rose-800 dark:text-rose-200"
                }`}>
                  {isAIThinking
                    ? "AI is thinking..."
                    : mode === "ai"
                    ? currentPlayer === "X"
                      ? "Your Turn"
                      : "AI's Turn"
                    : `Player ${currentPlayer}'s Turn`}
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {/* Game Board */}
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 p-4 sm:p-5 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-inner">
              {board.map((cell, index) => (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  disabled={!!cell || !!winner || isDraw || isAIThinking || (mode === "ai" && currentPlayer === "O")}
                  className={`group relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    winningLine?.includes(index)
                      ? cell === "X"
                        ? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50 scale-105"
                        : "bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg shadow-rose-500/50 scale-105"
                      : cell
                      ? "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-inner"
                      : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                  } ${!cell && !winner && !isDraw && !isAIThinking ? "active:scale-95" : ""}`}
                >
                  {/* Hover indicator */}
                  {!cell && !winner && !isDraw && !isAIThinking && !(mode === "ai" && currentPlayer === "O") && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 animate-pulse shadow-lg shadow-blue-400/50" />
                    </div>
                  )}

                  {cell === "X" && (
                    <X
                      className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 animate-scaleIn stroke-[2.5] sm:stroke-[3] ${
                        winningLine?.includes(index)
                          ? "text-white drop-shadow-lg"
                          : "text-blue-600 dark:text-blue-400"
                      }`}
                    />
                  )}
                  {cell === "O" && (
                    <Circle
                      className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 animate-scaleIn stroke-[2.5] sm:stroke-[3] ${
                        winningLine?.includes(index)
                          ? "text-white drop-shadow-lg"
                          : "text-rose-500 dark:text-rose-400"
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Move Counter */}
          <div className="flex justify-center mt-4">
            <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full">
              Move {moveCount} / 9
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
        <CustomButton
          variant="outline"
          onClick={resetGame}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          New Game
        </CustomButton>
        <CustomButton
          variant="secondary"
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Home
        </CustomButton>
      </div>
    </div>
  );
};

export default ClassicTicTacToe;
