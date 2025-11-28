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

      initializeGame: (gameId: string, initialMode: GameModeType = GameModeType.REMOTE) =>
        set((state) => ({
          games: {
            ...state.games,
            [gameId]: state.games[gameId] || { ...createInitialGameState(gameId), mode: initialMode },
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
        mode,
      ) =>
        set((state) => {
          const currentGame =
            state.games[gameId] || createInitialGameState(gameId);

          // Check if player already exists to avoid duplicates
          const playerExists = playerDetails && currentGame.players.some(
            (p) => p !== null && p.id === playerDetails.id
          );

          const updatedPlayers = playerExists
            ? currentGame.players
            : [...(currentGame.players || []), playerDetails];

          return {
            games: {
              ...state.games,
              [gameId]: {
                ...currentGame,
                players: updatedPlayers,
                watchers,
                currentPlayer,
                globalBoard,
                activeBoard,
                moveCount,
                winner,
                mode: mode || currentGame.mode,
              },
            },
          };
        }),

      updateWatcher: (gameId, watchers) =>
        set((state) => {
          // Only update if the game exists to avoid creating partial state
          if (!state.games[gameId]) {
            return state;
          }

          return {
            games: {
              ...state.games,
              [gameId]: {
                ...state.games[gameId],
                watchers,
              },
            },
          };
        }),

      updateGame: (
        gameId,
        globalBoard,
        activeBoard,
        moveCount,
        winner,
        currentPlayer,
        players,
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
              players: players || state.games[gameId]?.players || [],
            },
          },
        })),

      setGame: (gameId: string, gameState: GameState) =>
        set((state) => ({
          games: {
            ...state.games,
            [gameId]: gameState,
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
