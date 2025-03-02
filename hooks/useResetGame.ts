"use client";

import {
  HTTPExceptionSchema,
  ResetGameResponseSchema,
  ResetGameResponse,
} from "@/types";
import { useMutation } from "react-query";
import { toast } from "sonner";

export const useResetGame = () => {
  const resetGame = async ({
    game_id,
    user_id,
  }: {
    game_id: string;
    user_id: string;
  }): Promise<ResetGameResponse> => {
    const response = await fetch(`/api/py/game/reset-game`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ game_id, user_id }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = HTTPExceptionSchema.parse(data);
      toast.error(error.detail);
    }

    return ResetGameResponseSchema.parse(data);
  };

  const { mutate, isLoading } = useMutation({
    mutationFn: resetGame,
    retry: 2,
  });

  return { mutate, isLoading };
};
