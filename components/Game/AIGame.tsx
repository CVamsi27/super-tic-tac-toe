"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import SuperTicTacToe from "./SuperTicTacToe";

interface AIGameProps {
  difficulty?: "easy" | "medium" | "hard";
}

/**
 * AIGame Component
 * Wrapper component for playing against AI.
 * Handles AI move requests and game initialization.
 */
export default function AIGame({ difficulty = "medium" }: AIGameProps) {
  const params = useParams();
  const gameId = params?.gameId as string;
  const [userId] = useState(() => {
    // Generate a simple UUID-like string
    return "player-" + Math.random().toString(36).substring(2, 11);
  });
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [backendUrl, setBackendUrl] = useState("");

  useEffect(() => {
    // Get backend URL from environment or config
    const url =
      typeof window !== "undefined"
        ? window.location.origin === "http://localhost:3000"
          ? "http://127.0.0.1:8000"
          : process.env.NEXT_PUBLIC_BACKEND_URL ||
            "https://super-tic-tac-toe-api.buildora.work"
        : "https://super-tic-tac-toe-api.buildora.work";
    setBackendUrl(url);
  }, []);

  const getAIMove = async (boardState: Record<string, string>) => {
    if (!backendUrl) return null;

    setIsAIThinking(true);
    try {
      const response = await fetch(`${backendUrl}/api/ai/move`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game_id: gameId,
          board_state: boardState,
          difficulty: difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI move");
      }

      const data = await response.json();
      return data.move as [number, number];
    } catch (error) {
      console.error("Error getting AI move:", error);
      return null;
    } finally {
      setIsAIThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <SuperTicTacToe userId={userId} />
    </div>
  );
}
