"use client";

import { useRef, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WebSocketStatus } from "@/types";

export const useGameSocket = (gameId: string, userId: string) => {
  const { games, addPlayer, updateWatcher, updateGame } = useGameStore();
  const router = useRouter();
  const [status, setStatus] = useState<WebSocketStatus>(
    WebSocketStatus.PENDING,
  );
  const socketRef = useRef<WebSocket | null>(null);

  if (!socketRef.current && gameId && userId) {
    const socket = new WebSocket(
      `/api/py/game/ws/connect?game_id=${gameId}&user_id=${userId}`,
    );

    socket.onopen = () => {
      setStatus(WebSocketStatus.CONNECTED);
      toast.success("Connected to game");
      socket.send(JSON.stringify({ type: "join_game", userId }));
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "error":
            setStatus(WebSocketStatus.ERROR);
            toast.error(message.message);
            router.push("/");
            break;

          case "player_joined":
            addPlayer(
              gameId,
              {
                id: message.userId,
                symbol: message.symbol,
                status: message.status,
              },
              message.watchers_count || 0,
              message.game_state.global_board,
              message.game_state.active_board,
              message.game_state.move_count,
              message.game_state.winner,
              message.game_state.current_player,
            );
            break;

          case "game_update":
            updateGame(
              gameId,
              message.game_state.global_board,
              message.game_state.active_board,
              message.game_state.move_count,
              message.game_state.winner,
              message.game_state.current_player,
            );
            break;

          case "watchers_update":
            updateWatcher(gameId, message.watchers_count || 0);
            break;
        }
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    };

    socket.onclose = () => {
      if (status === WebSocketStatus.CONNECTED) {
        socket.send(JSON.stringify({ type: "leave", gameId, userId }));
      }
      setStatus(WebSocketStatus.DISCONNECTED);
      toast.error("Disconnected from game");
      socketRef.current = null;
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setStatus(WebSocketStatus.ERROR);
      toast.error("WebSocket connection error");
      socket.close();
    };

    socketRef.current = socket;
  }

  const sendMessage = (message: any) => {
    if (
      status === WebSocketStatus.CONNECTED &&
      socketRef.current?.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error("Unable to send message: WebSocket not connected");
    }
  };

  return { gameState: games[gameId] || null, sendMessage, status };
};
