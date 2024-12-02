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
    <div className="flex flex-col items-center justify-center bg-background my-4">
      <span className="font-bold text-2xl">Super Tic Tac Toe</span>
      <Card className="w-fit max-w-4xl p-4 shadow-2xl border-0 mt-4">
        <CardHeader className="p-0">
          <CardTitle className="text-center flex justify-center items-center">
            {winner && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-4"
                onClick={resetGame}
              >
                <RefreshCw className="w-6 h-6" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
