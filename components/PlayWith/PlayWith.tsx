"use client";

import { CHOOSE_GAME_TYPES } from "@/lib/const";
import { CustomButton } from "../ui/custom-button";
import { useRouter } from "next/navigation";
import { useCreateGame } from "@/hooks/useCreateGame";
import { GameModeType, GameVersion } from "@/types";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loading } from "../ui/loading";
import { extractErrorMessage } from "@/lib/utils";
import { CustomLink } from "../ui/custom-link";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { nanoid } from "nanoid";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, Bot, Shuffle, BookOpen, ArrowLeft, Zap, Brain, Trophy,
  Grid3X3
} from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

type DifficultyLevel = "easy" | "medium" | "hard";

const GAME_MODE_ICONS: Record<string, React.ReactNode> = {
  REMOTE: <Users className="w-5 h-5" />,
  AI: <Bot className="w-5 h-5" />,
  RANDOM: <Shuffle className="w-5 h-5" />,
  LOCAL: <Users className="w-5 h-5" />,
};

const DIFFICULTY_CONFIG = [
  { level: "easy" as DifficultyLevel, label: "Easy", desc: "Relaxed gameplay", icon: <Zap className="w-5 h-5" />, color: "from-green-500 to-emerald-600" },
  { level: "medium" as DifficultyLevel, label: "Medium", desc: "Balanced challenge", icon: <Brain className="w-5 h-5" />, color: "from-amber-500 to-orange-600" },
  { level: "hard" as DifficultyLevel, label: "Hard", desc: "Expert mode", icon: <Trophy className="w-5 h-5" />, color: "from-red-500 to-rose-600" },
];

const PlayWith = () => {
  const router = useRouter();
  const { mutate, isLoading, reset } = useCreateGame();
  const { user } = useAuth();
  const { playClick } = useSoundEffects();
  const [guestId, setGuestId] = useState<string>("");
  const currentUserId = user?.id || guestId;

  const { isSearching, queuePosition, queueSize, joinQueue, leaveQueue } = useMatchmaking(currentUserId);
  const [isButtonLoading, setIsButtonLoading] = useState<Record<GameModeType, boolean>>({
    [GameModeType.REMOTE]: false,
    [GameModeType.AI]: false,
    [GameModeType.RANDOM]: false,
    [GameModeType.LOCAL]: false,
  });
  
  // UI State - Default to SUPER mode
  const [gameVersion, setGameVersion] = useState<GameVersion>(GameVersion.SUPER);
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [showClassicOptions, setShowClassicOptions] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("medium");

  useEffect(() => {
    const storedGuestId = localStorage.getItem("guest_user_id") || nanoid();
    if (!localStorage.getItem("guest_user_id")) {
      localStorage.setItem("guest_user_id", storedGuestId);
    }
    setGuestId(storedGuestId);
  }, []);

  const handleVersionSelect = (version: GameVersion) => {
    playClick();
    setGameVersion(version);
    setShowClassicOptions(version === GameVersion.CLASSIC);
  };

  const handleGameCreation = (mode: GameModeType, difficulty?: DifficultyLevel) => {
    playClick();
    
    // Classic local game - no backend needed
    if (gameVersion === GameVersion.CLASSIC && mode === GameModeType.LOCAL) {
      router.push("/classic?mode=local");
      return;
    }

    // Classic AI game - no backend needed
    if (gameVersion === GameVersion.CLASSIC && mode === GameModeType.AI) {
      if (!difficulty) {
        setShowDifficultySelect(true);
        return;
      }
      router.push(`/classic?mode=ai&difficulty=${difficulty}`);
      return;
    }

    // Super mode with random matchmaking
    if (mode === GameModeType.RANDOM) {
      joinQueue();
      return;
    }

    // Super mode AI - show difficulty selection
    if (mode === GameModeType.AI && !difficulty) {
      setShowDifficultySelect(true);
      return;
    }

    // Create game on backend (Super mode only)
    setIsButtonLoading((prev) => ({
      ...prev,
      [mode]: true,
    }));

    reset();
    mutate(
      { mode, ai_difficulty: difficulty || "medium" },
      {
        onSuccess: (data) => {
          router.push(`/game/${data.game_id}`);
        },
        onError: (error) => {
          const message = extractErrorMessage(error);
          toast.error("Something went wrong", { description: message });
        },
        onSettled: () => {
          setIsButtonLoading((prev) => ({
            ...prev,
            [mode]: false,
          }));
          setShowDifficultySelect(false);
        },
      }
    );
  };

  const handleDifficultySelect = (difficulty: DifficultyLevel) => {
    playClick();
    setSelectedDifficulty(difficulty);
    handleGameCreation(GameModeType.AI, difficulty);
  };

  const goBack = () => {
    playClick();
    if (showDifficultySelect) {
      setShowDifficultySelect(false);
    } else if (showClassicOptions) {
      setShowClassicOptions(false);
      setGameVersion(GameVersion.SUPER);
    }
  };

  // Matchmaking search screen
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-5 sm:p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-violet-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-xl animate-pulse" />
          <Loading size="lg" />
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
            Finding Opponent...
          </p>
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-800/40 rounded-full text-blue-700 dark:text-blue-300 font-medium">
              Position: #{queuePosition !== null ? queuePosition + 1 : '...'}
            </span>
            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/40 rounded-full text-slate-600 dark:text-slate-400 font-medium">
              {Math.max(queueSize, (queuePosition !== null ? queuePosition + 1 : 0))} in queue
            </span>
          </div>
          {!user && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg mt-2 inline-block">
              ⚡ Playing as Guest
            </p>
          )}
        </div>
        <CustomButton
          variant="outline"
          onClick={leaveQueue}
          className="mt-1"
          size="sm"
        >
          Cancel Search
        </CustomButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between h-full w-full gap-4 sm:gap-5">
      <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
        
        {/* Super Mode (Default) - Show game mode options */}
        {gameVersion === GameVersion.SUPER && !showDifficultySelect && !showClassicOptions && (
          <>
            <p className="text-center font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base mb-1">
              Choose Your Game Mode
            </p>
            {Object.entries(CHOOSE_GAME_TYPES)
              .filter(([key]) => key !== "LOCAL")
              .map(([key, value], index) => (
                <div
                  key={key}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <CustomButton
                    disabled={isLoading}
                    onClick={() =>
                      handleGameCreation(GameModeType[key as keyof typeof GameModeType])
                    }
                    className="w-full group"
                  >
                    {isButtonLoading[GameModeType[key as keyof typeof GameModeType]] ? (
                      <Loading />
                    ) : (
                      <span className="flex items-center gap-2.5 group-hover:scale-105 transition-transform duration-200">
                        {GAME_MODE_ICONS[key]}
                        {value}
                      </span>
                    )}
                  </CustomButton>
                </div>
              ))}
            
            {/* Classic Mode Option */}
            <div className="animate-fadeInUp mt-2" style={{ animationDelay: "0.3s" }}>
              <button
                onClick={() => handleVersionSelect(GameVersion.CLASSIC)}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 transition-all duration-300 text-sm font-medium"
              >
                <Grid3X3 className="w-4 h-4" />
                Play Classic 3×3 Instead
              </button>
            </div>
          </>
        )}

        {/* Classic Mode Options */}
        {showClassicOptions && !showDifficultySelect && (
          <>
            <div className="text-center mb-2 animate-fadeInUp">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-2">
                <Grid3X3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Classic Mode</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                Choose Play Mode
              </h3>
            </div>

            <div className="animate-fadeInUp" style={{ animationDelay: "0.05s" }}>
              <CustomButton
                disabled={isLoading}
                onClick={() => handleGameCreation(GameModeType.LOCAL)}
                className="w-full group"
              >
                <span className="flex items-center gap-2.5 group-hover:scale-105 transition-transform duration-200">
                  <Users className="w-5 h-5" />
                  Local 2 Player
                </span>
              </CustomButton>
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              <CustomButton
                disabled={isLoading}
                onClick={() => handleGameCreation(GameModeType.AI)}
                className="w-full group"
              >
                {isButtonLoading[GameModeType.AI] ? (
                  <Loading />
                ) : (
                  <span className="flex items-center gap-2.5 group-hover:scale-105 transition-transform duration-200">
                    <Bot className="w-5 h-5" />
                    Play vs AI
                  </span>
                )}
              </CustomButton>
            </div>

            <button
              onClick={goBack}
              className="w-full mt-1 py-2.5 px-4 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Super Mode
            </button>
          </>
        )}

        {/* Step 3: Difficulty Selection (for AI mode) */}
        {showDifficultySelect && (
          <>
            <div className="text-center mb-2 animate-fadeInUp">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-2">
                <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">AI Battle</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                Select Difficulty
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose your challenge level
              </p>
            </div>
            {DIFFICULTY_CONFIG.map((difficulty, index) => (
              <div
                key={difficulty.level}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <button
                  disabled={isLoading}
                  onClick={() => handleDifficultySelect(difficulty.level)}
                  className={`w-full relative overflow-hidden rounded-xl p-3 sm:p-4 bg-gradient-to-r ${difficulty.color} text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isButtonLoading[GameModeType.AI] && selectedDifficulty === difficulty.level ? (
                    <Loading />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          {difficulty.icon}
                        </div>
                        <div className="text-left">
                          <span className="block text-sm sm:text-base font-bold">{difficulty.label}</span>
                          <span className="block text-xs opacity-90">{difficulty.desc}</span>
                        </div>
                      </div>
                      <div className="opacity-50">→</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-shine animate-shimmer opacity-30" />
                </button>
              </div>
            ))}
            <button
              onClick={goBack}
              className="w-full mt-1 py-2.5 px-4 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Play Modes
            </button>
          </>
        )}
      </div>
      
      <div className="border-t border-slate-200/80 dark:border-slate-700/80 pt-4 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
        <CustomLink
          className="w-full justify-center text-center flex items-center gap-2"
          variant="inverted"
          href="/rules"
        >
          <BookOpen className="w-4 h-4" />
          View Game Rules
        </CustomLink>
      </div>
    </div>
  );
};

export default PlayWith;
