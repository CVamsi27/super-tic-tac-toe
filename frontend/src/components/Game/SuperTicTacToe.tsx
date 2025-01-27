"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSuperTicTacToeState } from "@/hooks/useSuperTicTacToeState";
import { PlayerStatus } from "./PlayerStatus";
import { GameBoard } from "./GameBoard";
import { useParams, useRouter } from "next/navigation";
import { useGameWebSocket } from "@/hooks/useGameWebSocket";
import { toast } from "sonner";
import { ResetGame } from "./ResetGame";
import { useGameStore } from "@/store/useGameStore";

const SuperTicTacToe: React.FC<{ userId: string }> = ({ userId }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const router = useRouter();

  const { games, addPlayer, updateWatcher } = useGameStore();
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
        );
        break;

      case "watchers_update":
        updateWatcher(gameId, latestMessage.watchers_count || 0);
        break;
    }
  }, [latestMessage, router, userId, gameId, addPlayer, updateWatcher]);

  useEffect(() => {
    if (isConnected) {
      sendMessage({ type: "join_game", userId });
    } else {
      sendMessage({ type: "leave_watcher", userId });
    }
  }, [isConnected, sendMessage, userId]);

  const { globalBoard, activeBoard, winner, makeMove } =
    useSuperTicTacToeState(gameId);

  return (
    <div
      className={`flex flex-col items-center justify-center bg-background h-full ${
        gameState?.players.find((p) => p?.id === userId)?.status === "WATCHER"
          ? "pointer-events-none"
          : ""
      }`}
    >
      <Card className="w-fit max-w-4xl p-2 md:p-4 shadow-2xl border-0">
        <CardHeader className="py-2">
          <CardTitle className="text-center flex justify-between items-center">
            <span className="text-primary">
              Watchers: {gameState?.watchers || 0}
            </span>
            <ResetGame gameId={gameId} />
          </CardTitle>
        </CardHeader>
        <CardContent className="gap-2 p-2 md:p-4">
          <PlayerStatus
            currentPlayer={
              gameState?.players.find((p) => p?.id === userId)?.symbol || null
            }
            winner={winner}
          />
          <GameBoard
            globalBoard={globalBoard}
            activeBoard={activeBoard}
            makeMove={makeMove}
            winner={winner}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperTicTacToe;
