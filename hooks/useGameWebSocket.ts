"use client";

import config from "@/lib/config";
import { WebSocketMessage } from "@/types";
import { useRef, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export const useGameWebSocket = (gameId: string, userId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [latestMessage, setLatestMessage] = useState<WebSocketMessage | null>(
    null,
  );
  const socketRef = useRef<WebSocket | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = config.API_URL.startsWith("https") ? "wss" : "ws";
    const socket = new WebSocket(
      `${protocol}://${config.API_URL.replace(/^https?:\/\//, "")}/api/game/ws/connect?game_id=${gameId}&user_id=${userId}`,
    );

    socket.onopen = () => {
      setIsConnected(true);
      toast.success("Player joined successfully");
    };

    socket.onmessage = (event) => {
      try {
        setLatestMessage(JSON.parse(event.data));
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      setTimeout(connectWebSocket, 3000);
    };

    socketRef.current = socket;
  }, [gameId, userId]);

  const handleLeave = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }

    socketRef.current?.send(
      JSON.stringify({ type: "leave_watcher", gameId, userId }),
    );
  }, [gameId, userId]);

  useEffect(() => {
    if (userId) connectWebSocket();

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        handleLeave();
      } else if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };

    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleLeave);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleLeave);

      socketRef.current?.close();
    };
  }, [connectWebSocket, handleLeave, userId]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error("Unable to connect");
    }
  }, []);

  return { isConnected, latestMessage, sendMessage };
};
