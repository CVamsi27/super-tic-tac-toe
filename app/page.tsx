import PlayWith from "@/components/PlayWith/PlayWith";

export default function Home() {
  return (
    <div className="bg-gradient-main h-full flex items-center justify-start flex-col p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-lg">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 animate-slideInDown">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient mb-2 animate-slideInUp">
            Super Tic-Tac-Toe
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-2">
            Challenge your skills with an enhanced version
          </p>
          <div className="flex justify-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-float" style={{ animationDelay: "0s" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-float" style={{ animationDelay: "0.2s" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-float" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-card rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-700 animate-scaleIn">
          <div className="flex flex-col justify-between h-full gap-4 sm:gap-6">
            {/* Game Options */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <p className="text-center font-semibold text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                Choose Your Game Mode
              </p>
              <PlayWith />
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Play online with friends or enjoy a quick game
          </p>
          <div className="p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-green-200 dark:border-slate-600">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Tip: Create a game and share the link! First person to join becomes your opponent, others watch as spectators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
