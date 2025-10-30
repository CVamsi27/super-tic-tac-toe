import Link from "next/link";

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Navigation */}
      <nav className="bg-gradient-card backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-full px-4 py-2 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gradient">
            🎮 Super Tic Tac Toe
          </Link>
          <Link href="/" className="text-sm text-slate-700 hover:text-blue-600 font-medium">
            Back Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">📖 Super Tic-Tac-Toe Rules</h1>
            <p className="text-sm text-slate-600 mt-1">Master the game and dominate the leaderboard</p>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6">
            {/* Overview */}
            <div>
              <p className="text-slate-700">
                Super Tic-Tac-Toe is an advanced version of Tic-Tac-Toe played on a 3x3 grid of smaller Tic-Tac-Toe boards.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-200"></div>

            {/* Objective */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">🎯 Objective</h2>
              <p className="text-slate-700">
                Win three small boards in a row, column, or diagonal to claim victory.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-200"></div>

            {/* Gameplay */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">🎮 Gameplay</h2>
              <ul className="space-y-2">
                <li className="flex gap-3 text-slate-700">
                  <span className="text-blue-600 font-semibold flex-shrink-0">•</span>
                  <span>The game starts with an empty 3x3 grid of small Tic-Tac-Toe boards.</span>
                </li>
                <li className="flex gap-3 text-slate-700">
                  <span className="text-blue-600 font-semibold flex-shrink-0">•</span>
                  <span>Players take turns placing their mark (X or O) in a cell within a small board.</span>
                </li>
                <li className="flex gap-3 text-slate-700">
                  <span className="text-blue-600 font-semibold flex-shrink-0">•</span>
                  <span>Where a player moves determines the board where the next player must play.</span>
                </li>
                <li className="flex gap-3 text-slate-700">
                  <span className="text-blue-600 font-semibold flex-shrink-0">•</span>
                  <span>If the targeted board is already won or full, the player can choose any available board.</span>
                </li>
                <li className="flex gap-3 text-slate-700">
                  <span className="text-blue-600 font-semibold flex-shrink-0">•</span>
                  <span>Winning a small board is done by aligning three marks in a row, column, or diagonal.</span>
                </li>
                <li className="flex gap-3 text-slate-700">
                  <span className="text-blue-600 font-semibold flex-shrink-0">•</span>
                  <span>The game ends when a player wins three small boards in a row, column, or diagonal.</span>
                </li>
              </ul>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-200"></div>

            {/* Special Cases */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">⚡ Special Cases</h2>
              <ul className="space-y-2">
                <li className="flex gap-3 text-slate-700">
                  <span className="text-yellow-600 font-semibold flex-shrink-0">•</span>
                  <span>If a small board ends in a draw, it does not count toward any player&apos;s victory.</span>
                </li>
                <li className="flex gap-3 text-slate-700">
                  <span className="text-yellow-600 font-semibold flex-shrink-0">•</span>
                  <span>If all boards are full and no player has won, the game is a draw.</span>
                </li>
              </ul>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-200"></div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Control the center board for strategic advantage</li>
                <li>• Think ahead about where your move will send your opponent</li>
                <li>• Create winning positions in multiple boards simultaneously</li>
                <li>• Block opponent&apos;s board completions when possible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
