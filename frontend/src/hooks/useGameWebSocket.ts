import config from "@/lib/config";
import { WebSocketMessage } from "@/types";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { json } from "stream/consumers";

export const useGameWebSocket = (gameId: string) => {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [latestMessage, setLatestMessage] = useState<WebSocketMessage>();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`${config.API_URL}/api/game/ws/${gameId}`);
    socketRef.current = socket;
    socket.onopen = () => {
      // toast.success("WebSocket connected");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
        setLatestMessage(message);
      } catch (err) {
        toast.error("Error parsing WebSocket message", {
          description: JSON.stringify(err),
        });
      }
    };

    socket.onerror = (event) => {
      toast.error("WebSocket encountered an error", {
        description: JSON.stringify(event),
      });
    };

    socket.onclose = () => {
      // toast.info("WebSocket disconnected");
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, [gameId]);

  const sendMessage = (message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      toast.warning("WebSocket is not open. Unable to send message.");
    }
  };

  return {
    isConnected,
    messages,
    latestMessage,
    sendMessage,
  };
};
