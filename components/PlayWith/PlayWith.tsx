"use client";

import { CHOOSE_GAME_TYPES } from "@/lib/const";
import { CustomButton } from "../ui/custom-button";
import { useRouter } from "next/navigation";
import { useCreateGame } from "@/hooks/useCreateGame";
import { GameModeType } from "@/types";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loading } from "../ui/loading";
import { extractErrorMessage } from "@/lib/utils";
import { CustomLink } from "../ui/custom-link";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { nanoid } from "nanoid";
import { useAuth } from "@/context/AuthContext";

type DifficultyLevel = "easy" | "medium" | "hard";

const PlayWith = () => {
  const router = useRouter();
  const { mutate, isLoading, reset } = useCreateGame();
  const { user } = useAuth();
  const [guestId, setGuestId] = useState<string>("");
  const currentUserId = user?.id || guestId;

  const { isSearching, queuePosition, queueSize, joinQueue, leaveQueue } = useMatchmaking(currentUserId);
  const [isButtonLoading, setIsButtonLoading] = useState<
    Record<GameModeType, boolean>
  >({
    [GameModeType.REMOTE]: false,
    [GameModeType.AI]: false,
    [GameModeType.RANDOM]: false,
  });
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("medium");

  useEffect(() => {
    const storedGuestId = localStorage.getItem("guest_user_id") || nanoid();
    if (!localStorage.getItem("guest_user_id")) {
      localStorage.setItem("guest_user_id", storedGuestId);
    }
    setGuestId(storedGuestId);
  }, []);

  const handleGameCreation = (mode: GameModeType, difficulty?: DifficultyLevel) => {
    if (mode === GameModeType.RANDOM) {
      joinQueue();
      return;
    }

    if (mode === GameModeType.AI && !difficulty) {
      setShowDifficultySelect(true);
      return;
    }

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
    setSelectedDifficulty(difficulty);
    handleGameCreation(GameModeType.AI, difficulty);
  };

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 animate-pulse">
        <Loading />
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Searching for opponent...
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Position in queue: {queuePosition !== null ? queuePosition + 1 : '...'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
            Players in queue: {Math.max(queueSize, (queuePosition !== null ? queuePosition + 1 : 0))}
          </p>
          {!user && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
              Playing as Guest. Login to save stats.
            </p>
          )}
        </div>
        <CustomButton
          variant="outline"
          onClick={leaveQueue}
          className="mt-2"
        >
          Cancel Search
        </CustomButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between h-full w-full gap-3 sm:gap-4">
      <div className="flex flex-col gap-2 sm:gap-3 w-full">
        {!showDifficultySelect ? (
          <>
            <p className="text-center font-semibold text-slate-700 dark:text-slate-300 text-sm sm:text-base mb-1">
              Choose Your Game Mode
            </p>
            {Object.entries(CHOOSE_GAME_TYPES).map(([key, value], index) => (
              <div
                key={key}
                className="animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CustomButton
                  disabled={isLoading}
                  onClick={() =>
                    handleGameCreation(
                      GameModeType[key as keyof typeof GameModeType]
                    )
                  }
                  className="w-full"
                >
                  {isButtonLoading[GameModeType[key as keyof typeof GameModeType]] ? (
                    <Loading />
                  ) : null}
                  {value}
                </CustomButton>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="text-center mb-1 animate-slideInUp">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                Choose AI Difficulty
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Select how challenging you want the AI to be
              </p>
            </div>
            {[
              { level: "easy" as DifficultyLevel, label: "Easy", desc: "Perfect for beginners" },
              { level: "medium" as DifficultyLevel, label: "Medium", desc: "Balanced challenge" },
              { level: "hard" as DifficultyLevel, label: "Hard", desc: "Nearly unbeatable!" },
            ].map((difficulty, index) => (
              <div
                key={difficulty.level}
                className="animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CustomButton
                  disabled={isLoading}
                  onClick={() => handleDifficultySelect(difficulty.level)}
                  className="w-full h-auto py-3"
                  variant="default"
                >
                  {isButtonLoading[GameModeType.AI] && selectedDifficulty === difficulty.level ? (
                    <Loading />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-semibold text-sm leading-tight">{difficulty.label}</span>
                      <span className="text-[10px] opacity-70 font-normal leading-tight">{difficulty.desc}</span>
                    </div>
                  )}
                </CustomButton>
              </div>
            ))}
            <CustomButton
              variant="ghost"
              onClick={() => setShowDifficultySelect(false)}
              className="w-full mt-1 h-8"
              disabled={isLoading}
            >
              ← Back
            </CustomButton>
          </>
        )}
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 pt-3 animate-slideInUp">
        <CustomLink
          className="w-full justify-center text-center block"
          variant="inverted"
          href="/rules"
        >
          View Rules
        </CustomLink>
      </div>
    </div>
  );
};

export default PlayWith;
