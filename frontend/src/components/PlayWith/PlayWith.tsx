"use client";

import { CHOOSE_GAME_TYPES } from "@/lib/const";
import { CustomButton } from "../ui/custom-button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCreateGame } from "@/hooks/useCreateGame";
import { GameModeType } from "@/types";

const PlayWith = () => {
  const { mutate, isLoading, error, reset } = useCreateGame();
  const router = useRouter();

  const handleGameCreation = (mode: GameModeType) => {
    reset();
    mutate(mode, {
      onSuccess: (data) => {
        if (data?.game_id) {
          router.push(`/game/${data.game_id}`);
        }
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
          {isLoading ? <Loader2 className="animate-spin" /> : null}
          {value}
        </CustomButton>
      ))}
    </div>
  );
};

export default PlayWith;
