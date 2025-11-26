import { Target, Gamepad2, Zap, Lightbulb, ArrowLeft, Grid3X3, LayoutGrid } from "lucide-react";
import Link from "next/link";

export default function RulesPage() {
  return (
    <div className="flex-1 bg-gradient-main">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white dark:bg-slate-800/95 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl overflow-hidden animate-fadeInUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Gamepad2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Game Rules</h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-0.5">Master both versions</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
            
            {/* Classic Tic Tac Toe */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                  <Grid3X3 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Classic Tic Tac Toe</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">The timeless 3×3 game</p>
                </div>
              </div>
              
              <div className="p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  The original game that started it all! Two players take turns marking spaces in a <span className="font-semibold text-emerald-600 dark:text-emerald-400">3×3 grid</span>.
                </p>
                <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-emerald-500">•</span>
                    <span>First player is X, second player is O</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">•</span>
                    <span>Get 3 marks in a row (horizontal, vertical, or diagonal) to win</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500">•</span>
                    <span>If all 9 squares are filled with no winner, it&apos;s a draw</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

            {/* Super Tic Tac Toe */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/40 rounded-xl">
                  <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Super Tic Tac Toe</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Strategic 9×9 grid</p>
                </div>
              </div>

              {/* Overview */}
              <div className="p-3 sm:p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800/50">
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  An advanced version played on a <span className="font-semibold text-violet-600 dark:text-violet-400">3×3 grid of smaller boards</span>. Each move you make determines where your opponent plays next!
                </p>
              </div>

              {/* Objective */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">Objective</h3>
                </div>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  Win <span className="font-semibold">three small boards</span> in a row, column, or diagonal to claim victory.
                </p>
              </div>

              {/* Gameplay */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">How to Play</h3>
                </div>
                <ul className="space-y-2 sm:space-y-2.5">
                  {[
                    "The game starts with all 9 small boards empty and playable.",
                    "Players take turns placing their mark (X or O) in any cell.",
                    "Your move position determines where your opponent must play next.",
                    "If the target board is won or full, your opponent can play anywhere.",
                    "Win a small board by getting 3 marks in a row.",
                    "Win the game by winning 3 boards in a row!"
                  ].map((rule, index) => (
                    <li key={index} className="flex gap-2.5 sm:gap-3 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                      <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs sm:text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Special Cases */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">Special Rules</h3>
                </div>
                <ul className="space-y-2">
                  {[
                    "If a small board ends in a draw, it doesn't count for either player.",
                    "If all boards are full with no winner, the game is a tie."
                  ].map((rule, index) => (
                    <li key={index} className="flex gap-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                      <span className="text-purple-500">•</span>
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800/50">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-sm sm:text-base font-bold text-green-800 dark:text-green-200">Pro Tips</h3>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-green-800 dark:text-green-300">
                <li>• Control the center board for strategic advantage</li>
                <li>• Think ahead about where your move sends your opponent</li>
                <li>• Create winning positions in multiple boards at once</li>
                <li>• Block opponent&apos;s board completions when possible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
