"use client";
import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import clsx from "clsx";
import { cn } from "@/lib/utils";
import { WebSocketMessage } from "@/types";
import { useState, useEffect } from "react";

interface ResetGameProps {
  gameId: string;
  userId: string;
  classname: string | undefined;
  sendMessage: (message: WebSocketMessage) => void;
}

export const ResetGame: React.FC<ResetGameProps> = ({
  gameId,
  userId,
  classname,
  sendMessage,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Listen for game reset completion event
  useEffect(() => {
    const handleResetComplete = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.gameId === gameId) {
        setIsLoading(false);
      }
    };

    window.addEventListener("gameResetComplete", handleResetComplete);
    return () => {
      window.removeEventListener("gameResetComplete", handleResetComplete);
    };
  }, [gameId]);

  const handleResetGame = () => {
    // Prevent multiple simultaneous reset attempts
    if (isLoading) {
      toast.warning("Reset already in progress");
      return;
    }

    setIsLoading(true);
    try {
      sendMessage({
        type: "reset_game",
        gameId: gameId,
        userId: userId,
      });
      toast.info("Requesting game reset...");
    } catch (error) {
      toast.error("Failed to reset game");
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(
        "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-md hover:shadow-lg smooth-transition",
        classname,
      )}
      onClick={handleResetGame}
      disabled={isLoading}
      title="Reset game"
    >
      <RefreshCw
        className={clsx(
          "w-5 h-5 sm:w-6 sm:h-6 transition-transform",
          isLoading && "animate-spin",
        )}
      />
    </Button>
  );
};
