import PlayWith from "@/components/PlayWith/PlayWith";

export default function Home() {
  return (
    <div className="bg-gradient-main min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 animate-slideInDown">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gradient mb-3 animate-slideInUp">
            Super Tic-Tac-Toe
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-2">
            Challenge your skills with an enhanced version
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-float" style={{ animationDelay: "0s" }} />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-float" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-float" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-slate-200 dark:border-slate-700 animate-scaleIn">
          <div className="flex flex-col justify-between h-full gap-6 sm:gap-8">
            {/* Game Options */}
            <div className="flex flex-col gap-4 sm:gap-6">
              <p className="text-center font-semibold text-slate-700 dark:text-slate-300 text-base sm:text-lg">
                👥 Choose Your Game Mode
              </p>
              <PlayWith />
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 text-center space-y-3">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">
            Play online with friends or enjoy a quick game
          </p>
          <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-green-200 dark:border-slate-600">
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
              💡 Tip: Create a game and share the link! First person to join becomes your opponent, others watch as spectators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
