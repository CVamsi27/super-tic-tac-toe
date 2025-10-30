"use client";

import { useGameStore } from "@/store/useGameStore";
import { GameData, GameModeType, GameBoardType, GameSchema } from "@/types";
import { useEffect, useMemo } from "react";
import { useMutation } from "react-query";

export const useCreateGame = () => {
  const { games } = useGameStore();

  const createGame = async (mode: GameModeType, ai_difficulty: string = "medium"): Promise<GameData> => {
    const response = await fetch(`/api/py/game/create-game`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode, ai_difficulty }),
    });
    const data = await response.json();
    return GameSchema.parse(data);
  };

  const { mutate, data, isLoading, error, reset } = useMutation({
    mutationFn: (options: { mode: GameModeType; ai_difficulty?: string }) => 
      createGame(options.mode, options.ai_difficulty || "medium"),
    retry: 0,
  });

  const initialBoardState: GameBoardType = useMemo(
    () =>
      Array(9)
        .fill(null)
        .map(() => Array(9).fill(null)),
    [],
  );

  useEffect(() => {
    if (data && !games[data.game_id]) {
      useGameStore.setState((state) => ({
        games: {
          ...state.games,
          [data.game_id]: {
            id: data.game_id,
            players: [],
            watchers: 0,
            moveCount: 0,
            globalBoard: initialBoardState,
            activeBoard: null,
            winner: null,
            currentPlayer: null,
            mode: GameModeType.REMOTE,
          },
        },
      }));
    }
  }, [data, games, initialBoardState]);

  return { mutate, data, isLoading, error, reset };
};
