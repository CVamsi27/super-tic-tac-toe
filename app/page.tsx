import PlayWith from "@/components/PlayWith/PlayWith";

export default function Home() {
  return (
    <div className="h-full flex items-center justify-center flex-col p-4 sm:p-6">
      <div className="w-full max-w-lg flex flex-col items-center justify-center gap-4 sm:gap-6">
        <div className="text-center mb-0 sm:mb-0 animate-slideInDown">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient mb-2 animate-slideInUp">
            Super Tic-Tac-Toe
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-2">
            Challenge your skills
          </p>
        </div>

        <div className="bg-gradient-card rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-700 animate-scaleIn w-full">
          <div className="flex flex-col justify-between h-full gap-4 sm:gap-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <PlayWith />
            </div>
          </div>
        </div>

        <div className="mt-0 text-center space-y-2 w-full max-w-lg">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Play online with friends or enjoy a quick game
          </p>
          <div className="p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-green-200 dark:border-slate-600">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Tip: Create a game and share the link! First person to join becomes your opponent, others watch as spectators.
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Note: Login to save your progress and appear on the global leaderboard!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
