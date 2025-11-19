"use client";

import { CHOOSE_GAME_TYPES } from "@/lib/const";
import { CustomButton } from "../ui/custom-button";
import { useRouter } from "next/navigation";
import { useCreateGame } from "@/hooks/useCreateGame";
import { GameModeType } from "@/types";
import { toast } from "sonner";
import { useState } from "react";
import { Loading } from "../ui/loading";
import { extractErrorMessage } from "@/lib/utils";
import { CustomLink } from "../ui/custom-link";

type DifficultyLevel = "easy" | "medium" | "hard";

const PlayWith = () => {
  const router = useRouter();
  const { mutate, isLoading, reset } = useCreateGame();
  const [isButtonLoading, setIsButtonLoading] = useState<
    Record<GameModeType, boolean>
  >({
    [GameModeType.REMOTE]: false,
    [GameModeType.AI]: false,
  });
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("medium");

  const handleGameCreation = (mode: GameModeType, difficulty?: DifficultyLevel) => {
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

  return (
    <div className="flex flex-col justify-between h-full w-full gap-3 sm:gap-4">
      <div className="flex flex-col gap-2 sm:gap-3 w-full">
        {!showDifficultySelect ? (
          // Game Mode Selection
          Object.entries(CHOOSE_GAME_TYPES).map(([key, value], index) => (
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
          ))
        ) : (
          // Difficulty Selection for AI
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
              { level: "hard" as DifficultyLevel, label: "Hard", desc: "Maximum difficulty" },
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
                  variant={selectedDifficulty === difficulty.level ? "default" : "outline"}
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
