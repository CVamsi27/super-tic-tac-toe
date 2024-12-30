"use client";

import { CHOOSE_GAME_TYPES } from "@/lib/const";
import { CustomButton } from "../ui/custom-button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCreateGame } from "@/hooks/useCreateGame";
import { GameModeType } from "@/types";
import { toast } from "sonner";
import { useState } from "react";

const PlayWith = () => {
  const router = useRouter();
  const { mutate, isLoading, reset } = useCreateGame();
  const [isButtonLoading, setIsButtonLoading] = useState<
    Record<GameModeType, boolean>
  >({
    [GameModeType.LOCAL]: false,
    [GameModeType.REMOTE]: false,
    [GameModeType.AI]: false,
  });

  const handleGameCreation = (mode: GameModeType) => {
    setIsButtonLoading((prev) => ({
      ...prev,
      [mode]: true,
    }));

    reset();
    mutate(mode, {
      onSuccess: (data) => {
        router.push(`/game/${data.game_id}`);
      },
      onError: (error) => {
        toast("Something went wrong", {
          description: JSON.stringify(error),
        });
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
            <Loader2 className="animate-spin" />
          ) : null}
          {value}
        </CustomButton>
      ))}
    </div>
  );
};

export default PlayWith;
