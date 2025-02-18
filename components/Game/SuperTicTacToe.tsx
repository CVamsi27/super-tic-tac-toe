"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSuperTicTacToeState } from "@/hooks/useSuperTicTacToeState";
import { PlayerStatus } from "./PlayerStatus";
import { GameBoard } from "./GameBoard";
import { useParams } from "next/navigation";
import { ResetGame } from "./ResetGame";

const SuperTicTacToe: React.FC<{ userId: string }> = ({ userId }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const { gameState, sendMessage } = useSuperTicTacToeState(gameId, userId);
  return (
    <div
      className={`flex flex-col items-center justify-center bg-background h-full ${
        (gameState?.players.find((p) => p?.id === userId)?.status ===
          "WATCHER" ||
          gameState?.currentPlayer !==
            gameState?.players.find((p) => p?.id === userId)?.symbol ||
          gameState?.currentPlayer === null) &&
        gameState.winner === null
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
            gameId={gameId}
            currentPlayer={gameState?.currentPlayer || null}
            actualPlayer={
              gameState?.players.find((p) => p?.id === userId) || null
            }
          />
          <GameBoard
            gameId={gameId}
            userId={userId}
            sendMessage={sendMessage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperTicTacToe;
