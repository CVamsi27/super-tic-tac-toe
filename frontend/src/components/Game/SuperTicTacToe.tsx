"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useSuperTicTacToeState } from "@/hooks/useSuperTicTacToeState";
import { PlayerStatus } from "./PlayerStatus";
import { GameBoard } from "./GameBoard";

const SuperTicTacToe: React.FC = () => {
  const {
    globalBoard,
    currentPlayer,
    activeBoard,
    winner,
    makeMove,
    resetGame,
  } = useSuperTicTacToeState();

  return (
    <div className="flex flex-col items-center justify-center bg-background">
      <Card className="w-fit max-w-4xl p-2 md:p-4 shadow-2xl border-0 mt-4">
        <CardHeader className="p-0">
          <CardTitle className="text-center flex justify-center items-center">
              <Button
                variant="ghost"
                size="icon"
                className="bg-secondary hover:text-secondary hover:bg-primary"
                onClick={resetGame}
              >
                <RefreshCw className="w-6 h-6" />
              </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="gap-2 mt-2 p-2 md:p-4">
          <PlayerStatus currentPlayer={currentPlayer} winner={winner} />
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
