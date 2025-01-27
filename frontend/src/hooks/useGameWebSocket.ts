"use client";

import config from "@/lib/config";
import { WebSocketMessage } from "@/types";
import { useRef, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

const socketInstances: Record<string, WebSocket> = {};

export const useGameWebSocket = (gameId: string, userId: string) => {
  const [latestMessage, setLatestMessage] = useState<WebSocketMessage | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = useCallback(() => {
    if (socketInstances[gameId]?.readyState === WebSocket.OPEN) {
      toast.info("Player already available");
      return;
    }

    const protocol = config.API_URL.startsWith("https") ? "wss" : "ws";
    const socket = new WebSocket(
      `${protocol}://${config.API_URL.replace(/^https?:\/\//, "")}/api/game/ws/connect?game_id=${encodeURIComponent(gameId)}&user_id=${encodeURIComponent(userId)}`,
    );

    socketInstances[gameId] = socket;

    socket.onopen = () => {
      setIsConnected(true);
      toast.success("Player joined successfully");
    };

    socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLatestMessage(message);
      } catch (err) {
        toast.error("Error parsing message", {
          description: JSON.stringify(err),
        });
      }
    };

    socket.onerror = () => {
      toast.error("An error encountered");
    };

    socket.onclose = () => {
      setIsConnected(false);
      toast.info("Connection closed, retrying...");

      if (!retryTimeoutRef.current) {
        retryTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      }
    };
  }, [gameId, userId]);

  useEffect(() => {
    if (userId) connectWebSocket();

    const sendLeaveWatcher = () => {
      const socket = socketInstances[gameId];
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "leave_watcher" }));
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      sendLeaveWatcher();
      event.preventDefault();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendLeaveWatcher();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("unload", sendLeaveWatcher);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("unload", sendLeaveWatcher);

      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);

      const socket = socketInstances[gameId];
      if (socket) {
        socket.close();
        delete socketInstances[gameId];
      }
    };
  }, [connectWebSocket, gameId, userId]);

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      const socket = socketInstances[gameId];
      if (!isConnected || socket?.readyState !== WebSocket.OPEN) {
        toast.warning("Unable to connect");
        return;
      }
      socket.send(JSON.stringify(message));
    },
    [isConnected, gameId],
  );

  return {
    isConnected,
    latestMessage,
    sendMessage,
  };
};
