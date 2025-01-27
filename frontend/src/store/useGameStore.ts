"use client";

import { Player } from "@/types";
import { create } from "zustand";

interface GameState {
  players: Player[];
  watchers: number;
}

interface GameStore {
  games: Record<string, GameState>;
  addGame: (gameId: string, gameState: GameState) => void;
  updateGame: (gameId: string, gameState: Partial<GameState>) => void;
  addPlayer: (gameId: string, playerDetails: Player, watchers: number) => void;
  updateWatcher: (gameId: string, watchers: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  games: {},
  addGame: (gameId, gameState) =>
    set((state) => ({
      games: { ...state.games, [gameId]: gameState },
    })),
  updateGame: (gameId, gameState) =>
    set((state) => ({
      games: {
        ...state.games,
        [gameId]: { ...state.games[gameId], ...gameState },
      },
    })),
  addPlayer: (gameId, playerDetails, watchers) =>
    set((state) => {
      const existingGame = state.games[gameId] || { players: [], watchers: 0 };
      return {
        games: {
          ...state.games,
          [gameId]: {
            ...existingGame,
            players: [...(existingGame.players || []), playerDetails],
            watchers,
          },
        },
      };
    }),
  updateWatcher: (gameId, watchers) =>
    set((state) => {
      const existingGame = state.games[gameId] || { players: [] };

      return {
        games: {
          ...state.games,
          [gameId]: {
            ...existingGame,
            players: [...existingGame.players],
            watchers,
          },
        },
      };
    }),
}));
