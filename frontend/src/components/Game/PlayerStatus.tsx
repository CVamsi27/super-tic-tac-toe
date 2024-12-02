"use client";

import { PlayerType } from "@/types";
import { Circle, X } from "lucide-react";
import React from "react";

export const PlayerStatus: React.FC<{
  currentPlayer: PlayerType;
  winner: PlayerType | null;
}> = React.memo(({ currentPlayer, winner }) => {
  return (
    <div className="flex justify-between items-center mb-4 font-bold">
      <div className="flex items-center space-x-2">
        <span>Current Player:</span>
        {currentPlayer === "X" ? (
          <X className="text-blue-600" />
        ) : (
          <Circle className="text-red-600" />
        )}
      </div>
      {winner && (
        <div className="text-lg font-bold">
          Winner:{" "}
          {winner === "X" ? (
            <X className="inline text-blue-600" />
          ) : (
            <Circle className="inline text-red-600" />
          )}
        </div>
      )}
    </div>
  );
});
