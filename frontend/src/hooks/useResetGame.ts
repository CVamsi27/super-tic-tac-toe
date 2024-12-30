"use client";

import config from "@/lib/config";
import { useMutation } from "react-query";
import { z } from "zod";

export const useResetGame = () => {
  const resetGame = async (game_id: string): Promise<boolean> => {
    const response = await fetch(`${config.API_URL}/api/game/reset-game`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ game_id }),
    });
    const data = await response.json();
    return z.boolean().parse(data);
  };

  const { mutate, isLoading } = useMutation({
    mutationFn: resetGame,
    retry: 2,
  });

  return { mutate, isLoading };
};
