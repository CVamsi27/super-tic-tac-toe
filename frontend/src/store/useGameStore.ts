"use client";

import { GameBoardType, GameModeType, GameState, GameStore } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const initialBoardState: GameBoardType = Array(9)
  .fill(null)
  .map(() => Array(9).fill(null));

const createInitialGameState = (gameId: string): GameState => ({
  id: gameId,
  players: [],
  globalBoard: initialBoardState,
  currentPlayer: null,
  activeBoard: null,
  watchers: 0,
  winner: null,
  moveCount: 0,
  mode: "remote" as GameModeType,
});

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      games: {},

      initializeGame: (gameId: string) =>
        set((state) => ({
          games: {
            ...state.games,
            [gameId]: state.games[gameId] || createInitialGameState(gameId),
          },
        })),

      addPlayer: (
        gameId,
        playerDetails,
        watchers,
        globalBoard,
        activeBoard,
        moveCount,
        winner,
        currentPlayer,
      ) =>
        set((state) => {
          const currentGame =
            state.games[gameId] || createInitialGameState(gameId);
          return {
            games: {
              ...state.games,
              [gameId]: {
                ...currentGame,
                players: [...(currentGame.players || []), playerDetails],
                watchers,
                currentPlayer,
                globalBoard,
                activeBoard,
                moveCount,
                winner,
              },
            },
          };
        }),

      updateWatcher: (gameId, watchers) =>
        set((state) => ({
          games: {
            ...state.games,
            [gameId]: {
              ...state.games[gameId],
              watchers,
            },
          },
        })),

      updateGame: (
        gameId,
        globalBoard,
        activeBoard,
        moveCount,
        winner,
        currentPlayer,
      ) =>
        set((state) => ({
          games: {
            ...state.games,
            [gameId]: {
              ...state.games[gameId],
              globalBoard,
              activeBoard,
              moveCount,
              winner,
              currentPlayer,
            },
          },
        })),
    }),
    {
      name: "game-storage",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    },
  ),
);
