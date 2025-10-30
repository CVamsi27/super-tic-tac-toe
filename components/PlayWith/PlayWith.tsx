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

const PlayWith = () => {
  const router = useRouter();
  const { mutate, isLoading, reset } = useCreateGame();
  const [isButtonLoading, setIsButtonLoading] = useState<
    Record<GameModeType, boolean>
  >({
    [GameModeType.REMOTE]: false,
    [GameModeType.AI]: false,
  });

  const handleGameCreation = (mode: GameModeType) => {
    setIsButtonLoading((prev) => ({
      ...prev,
      [mode]: true,
    }));

    if (mode === "ai") {
      router.push(`/soon`);
      return;
    }

    reset();
    mutate(mode, {
      onSuccess: (data) => {
        router.push(`/game/${data.game_id}`);
      },
      onError: (error) => {
        console.log(error);
        const message = extractErrorMessage(error);
        toast.error("Something went wrong", { description: message });
      },
      onSettled: () => {
        setIsButtonLoading((prev) => ({
          ...prev,
          [mode]: false,
        }));
      },
    });
  };

  return (
    <div className="flex flex-col justify-between h-full w-full gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:gap-4 w-full">
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
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 animate-slideInUp">
        <CustomLink
          className="w-full justify-center text-center block"
          variant="inverted"
          href="/rules"
        >
          📖 View Rules
        </CustomLink>
      </div>
    </div>
  );
};

export default PlayWith;
