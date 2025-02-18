"use client";

import { Player, PlayerType } from "@/types";
import { Circle, X } from "lucide-react";
import React, { useMemo } from "react";
import { Loading } from "../ui/loading";
import { useGameStore } from "@/store/useGameStore";
import WinnerModal from "./WinnerModal";

export const PlayerStatus: React.FC<{
  gameId: string;
  currentPlayer: PlayerType;
  actualPlayer: Player;
}> = React.memo(({ currentPlayer, gameId, actualPlayer }) => {
  const { games } = useGameStore();
  const winner = useMemo<PlayerType>(
    () => games[gameId]?.winner,
    [gameId, games],
  );
  return (
    <div className="flex justify-between items-center mb-4 font-bold">
      <div className="flex items-center space-x-2">
        <span className="text-primary">Current Player:</span>
        {currentPlayer === null ? (
          <Loading />
        ) : currentPlayer === "X" ? (
          <X className="text-blue-600" />
        ) : (
          <Circle className="text-red-600" />
        )}
      </div>
      {actualPlayer?.status === "PLAYER" && (
        <div className="flex items-center space-x-2">
          <span className="text-primary">You are:</span>
          {actualPlayer === null ? (
            <Loading />
          ) : actualPlayer.symbol === "X" ? (
            <X className="text-blue-600" />
          ) : (
            <Circle className="text-red-600" />
          )}
        </div>
      )}

      {winner && <WinnerModal winner={winner} />}
    </div>
  );
});
