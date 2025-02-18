"use client";

import { useEffect, useMemo } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useGameWebSocket } from "./useGameWebSocket";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useSuperTicTacToeState = (gameId: string, userId: string) => {
  const { games, addPlayer, updateWatcher, updateGame } = useGameStore();
  const router = useRouter();

  const currentPlayer = useMemo(
    () => games[gameId]?.players.find((p) => p?.id === userId),
    [games, gameId, userId],
  );

  const gameState = games[gameId] || null;

  const { isConnected, latestMessage, sendMessage } = useGameWebSocket(
    gameId,
    userId,
  );

  useEffect(() => {
    if (!latestMessage) return;

    switch (latestMessage.type) {
      case "error":
        toast.error(latestMessage.message);
        router.push("/");
        break;

      case "player_joined":
        addPlayer(
          gameId,
          {
            id: latestMessage.userId,
            symbol: latestMessage.symbol,
            status: latestMessage.status,
          },
          latestMessage.watchers_count || 0,
          latestMessage.game_state.global_board,
          latestMessage.game_state.active_board,
          latestMessage.game_state.move_count,
          latestMessage.game_state.winner,
          latestMessage.game_state.current_player,
        );
        break;

      case "game_update":
        updateGame(
          gameId,
          latestMessage.game_state.global_board,
          latestMessage.game_state.active_board,
          latestMessage.game_state.move_count,
          latestMessage.game_state.winner,
          latestMessage.game_state.current_player,
        );
        break;

      case "watchers_update":
        updateWatcher(gameId, latestMessage.watchers_count || 0);
        break;
    }
  }, [
    latestMessage,
    router,
    userId,
    gameId,
    addPlayer,
    updateWatcher,
    updateGame,
  ]);

  useEffect(() => {
    if (isConnected) {
      sendMessage({ type: "join_game", userId });
    } else {
      sendMessage({ type: "leave_watcher", gameId, userId });
    }
  }, [isConnected, sendMessage, gameId, userId]);

  return {
    gameState,
    currentPlayer,
    sendMessage,
  };
};
