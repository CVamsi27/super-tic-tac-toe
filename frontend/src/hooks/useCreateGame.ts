"use client";

import config from "@/lib/config";
import { GameData, GameModeType, GameSchema } from "@/types";
import { useMutation } from "react-query";

export const useCreateGame = () => {
  const createGame = async (mode: GameModeType): Promise<GameData> => {
    const response = await fetch(`${config.API_URL}/api/game/create-game`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode }),
    });
    const data = await response.json();
    return GameSchema.parse(data);
  };

  const { mutate, data, isLoading, error, reset } = useMutation({
    mutationFn: (mode: GameModeType) => createGame(mode),
    retry: 0,
  });
  return { mutate, data, isLoading, error, reset };
};
