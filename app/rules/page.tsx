import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function RulesPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-2xl">Super Tic-Tac-Toe Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Super Tic-Tac-Toe is an advanced version of Tic-Tac-Toe played on a
            3x3 grid of smaller Tic-Tac-Toe boards.
          </p>
          <Separator />
          <div>
            <h2 className="text-xl font-semibold">Objective</h2>
            <p>
              Win three small boards in a row, column, or diagonal to claim
              victory.
            </p>
          </div>
          <Separator />
          <div>
            <h2 className="text-xl font-semibold">Gameplay</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                The game starts with an empty 3x3 grid of small Tic-Tac-Toe
                boards.
              </li>
              <li>
                Players take turns placing their mark (X or O) in a cell within
                a small board.
              </li>
              <li>
                Where a player moves determines the board where the next player
                must play.
              </li>
              <li>
                If the targeted board is already won or full, the player can
                choose any available board.
              </li>
              <li>
                Winning a small board is done by aligning three marks in a row,
                column, or diagonal.
              </li>
              <li>
                The game ends when a player wins three small boards in a row,
                column, or diagonal.
              </li>
            </ul>
          </div>
          <Separator />
          <div>
            <h2 className="text-xl font-semibold">Special Cases</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                If a small board ends in a draw, it does not count toward any
                player&apos;s victory.
              </li>
              <li>
                If all boards are full and no player has won, the game is a
                draw.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
