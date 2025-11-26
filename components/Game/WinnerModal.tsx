import { PlayerType, GameState, GameModeType } from "@/types";
import { Handshake, LogIn, Trophy, Frown, RotateCcw, X as CloseIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Confetti } from "@/components/Confetti";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useSettingsStore } from "@/store/useSettingsStore";
import { showAchievementToast } from "@/components/AchievementToast";
import { GameStats } from "@/components/GameStats";

export default function WinnerModal({ winner, gameState, sendMessage, userId }: { winner: PlayerType; gameState: GameState | null; sendMessage: (message: any) => void; userId: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { playWin, playLose, playDraw } = useSoundEffects();
  const { incrementGamesPlayed, updateDailyStreak, addAchievement, achievements } = useSettingsStore();

  const getWinnerName = () => {
    if (!gameState || !winner || winner === "T") return null;
    const winningPlayer = gameState.players.find(p => p?.symbol === winner);
    if (!winningPlayer) return null;
    
    if (winningPlayer.id.startsWith("ai_")) return "AI";
    
    return `${winningPlayer.name} (${winningPlayer.symbol})`;
  };

  const winnerName = getWinnerName();
  
  const didUserWin = () => {
    if (!user || !gameState || !winner || winner === "T") return false;
    const winningPlayer = gameState.players.find(p => p?.symbol === winner);
    return winningPlayer?.id === user.id;
  };

  const userWon = didUserWin();

  // Play sound effects and track stats when modal opens
  useEffect(() => {
    if (isOpen) {
      incrementGamesPlayed();
      updateDailyStreak();
      
      if (winner === "T") {
        playDraw();
      } else if (userWon) {
        playWin();
        setShowConfetti(true);
        
        // Check for first win achievement
        if (!achievements.includes("first_win")) {
          addAchievement("first_win");
          setTimeout(() => showAchievementToast("first_win"), 500);
        }
        
        // Check for AI achievements
        if (gameState?.mode === GameModeType.AI) {
          const aiAchievement = "ai_easy"; // Default for now
          if (!achievements.includes(aiAchievement)) {
            addAchievement(aiAchievement);
            setTimeout(() => showAchievementToast(aiAchievement), 1500);
          }
        }
        
        // Quick win achievement
        if (gameState && gameState.moveCount < 20 && !achievements.includes("quick_win")) {
          addAchievement("quick_win");
          setTimeout(() => showAchievementToast("quick_win"), 2500);
        }
      } else {
        playLose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handlePlayAgain = () => {
    if (gameState && userId) {
      if (gameState.mode === GameModeType.RANDOM) {
        router.push("/");
      } else {
        sendMessage({
          type: "reset_game",
          gameId: gameState.id,
          userId: userId,
        });
        setIsOpen(false);
      }
    }
  };

  return (
    isOpen && (
      <>
        {/* Confetti for wins */}
        <Confetti isActive={showConfetti} />
        
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
        <div className="relative bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm sm:max-w-md text-center animate-scaleIn">
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>

          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gradient flex items-center justify-center gap-2">
              Game Over!
            </h2>
          </div>
          
          <div className="mb-5 sm:mb-6">
            {winner === "T" ? (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                  <Handshake className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 font-bold">
                    It&apos;s a Tie!
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Great strategy on both sides!
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                {userWon ? (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl animate-pulse" />
                      <div className="relative p-4 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 rounded-2xl">
                        <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        You Won! 🎉
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Congratulations on your victory!
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                      <Frown className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-300">
                        {winnerName ? (
                          <>
                            <span className="text-gradient">{winnerName}</span>
                            {" wins!"}
                          </>
                        ) : (
                          `Player ${winner} wins!`
                        )}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Better luck next time!
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Game Stats */}
          <GameStats 
            moveCount={gameState?.moveCount || 0}
            isWinner={userWon}
          />

          {!user && winner !== "T" && (
            <div className="mb-5 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2.5">
                Save your progress and climb the leaderboard!
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl"
              >
                <LogIn size={16} />
                Login to Save
              </Link>
            </div>
          )}

          <div className="flex flex-col xs:flex-row justify-center gap-2.5 sm:gap-3">
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-300 active:scale-[0.98] text-sm sm:text-base"
              onClick={handlePlayAgain}
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
            <button
              className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all duration-300 active:scale-[0.98] text-sm sm:text-base"
              onClick={() => {
                if (gameState?.mode === GameModeType.RANDOM) {
                  router.push("/");
                } else {
                  setIsOpen(false);
                }
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      </>
    )
  );
}
