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
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col gap-8 mt-10">
        {Object.entries(CHOOSE_GAME_TYPES).map(([key, value]) => (
          <CustomButton
            disabled={isLoading}
            onClick={() =>
              handleGameCreation(GameModeType[key as keyof typeof GameModeType])
            }
            key={key}
          >
            {isButtonLoading[GameModeType[key as keyof typeof GameModeType]] ? (
              <Loading />
            ) : null}
            {value}
          </CustomButton>
        ))}
      </div>
      <CustomLink className="mb-10" variant="inverted" href="/rules">
        Rules
      </CustomLink>
    </div>
  );
};

export default PlayWith;
